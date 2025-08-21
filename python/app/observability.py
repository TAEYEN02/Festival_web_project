# app/observability.py
import json
import logging
import time
import typing as t
import uuid

from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

# uvicorn 기본 로거와 통일
logger_app = logging.getLogger("uvicorn.error")
logger_access = logging.getLogger("uvicorn.access")


def setup_logging(level: str = "INFO") -> None:
    """
    간단한 로깅 포맷을 설정합니다.
    (uvicorn --reload 사용 시 uvicorn이 포맷을 담당하므로 큰 차이는 없습니다)
    """
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    각 요청에 고유한 request_id를 부여하여 추적합니다.
    클라이언트가 X-Request-ID 를 보냈다면 그대로 사용합니다.
    """
    def __init__(self, app: ASGIApp, header_name: str = "X-Request-ID") -> None:
        super().__init__(app)
        self.header_name = header_name

    async def dispatch(self, request: Request, call_next):
        req_id = request.headers.get(self.header_name)
        if not req_id:
            req_id = str(uuid.uuid4())
        # state 에 저장하여 핸들러/미들웨어/예외처리기에서 사용
        request.state.request_id = req_id

        response = await call_next(request)
        response.headers[self.header_name] = req_id
        return response


class AccessLogMiddleware(BaseHTTPMiddleware):
    """
    요청/응답 액세스 로그.
    - 메서드, 경로, 상태코드, 소요시간(ms), request_id, 클라이언트IP
    - 요청/응답 바디는 개인정보/크기 문제로 기본 비활성 (원하면 옵션화 가능)
    """
    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()

        client_host = request.client.host if request.client else "-"
        method = request.method
        path = request.url.path

        # 라우팅 전에 request_id 가 설정되도록 RequestIDMiddleware 뒤에 배치 권장
        req_id = getattr(request.state, "request_id", "-")

        try:
            response = await call_next(request)
            status = response.status_code
            elapsed_ms = int((time.perf_counter() - start) * 1000)

            logger_access.info(
                "access method=%s path=%s status=%s latency_ms=%s rid=%s client=%s",
                method, path, status, elapsed_ms, req_id, client_host,
            )
            return response
        except Exception as e:
            # 여기에서 캐치되는 예외는 전역 예외 핸들러에서도 처리됩니다.
            elapsed_ms = int((time.perf_counter() - start) * 1000)
            logger_app.exception(
                "unhandled error method=%s path=%s latency_ms=%s rid=%s client=%s err=%s",
                method, path, elapsed_ms, req_id, client_host, repr(e),
            )
            raise


# =========================
# 전역 예외 핸들러
# =========================
def _build_error_payload(
    request: Request,
    message: str,
    status_code: int,
    extra: t.Optional[dict] = None,
) -> dict:
    payload: dict = {
        "ok": False,
        "status": status_code,
        "detail": message,
        "path": request.url.path,
        "method": request.method,
        "request_id": getattr(request.state, "request_id", None),
    }
    if extra:
        payload["extra"] = extra
    return payload


async def http_exception_handler(request: Request, exc: HTTPException):
    payload = _build_error_payload(
        request,
        message=exc.detail if isinstance(exc.detail, str) else "HTTP error",
        status_code=exc.status_code,
    )
    return JSONResponse(payload, status_code=exc.status_code)


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # FastAPI 기본 detail(list[ErrorWrapper])을 그대로 내려주되, 우리의 공통 포맷에 포함
    payload = _build_error_payload(
        request,
        message="요청 본문 검증에 실패했습니다.",
        status_code=422,
        extra={"errors": json.loads(exc.json())},
    )
    return JSONResponse(payload, status_code=422)


async def generic_exception_handler(request: Request, exc: Exception):
    # 알 수 없는 예외는 500으로 래핑
    logger_app.exception("unhandled exception rid=%s", getattr(request.state, "request_id", "-"))
    payload = _build_error_payload(
        request,
        message="서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        status_code=500,
    )
    return JSONResponse(payload, status_code=500)


def install_observability(app: FastAPI) -> None:
    """
    미들웨어와 예외 핸들러를 한 번에 등록하는 함수.
    app.create 후 즉시 호출하세요.
    """
    # 순서: RequestID -> AccessLog
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(AccessLogMiddleware)

    # 전역 예외 핸들러
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, generic_exception_handler)
