# tabs: 4
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import time

def setup_logging(level: str = "INFO") -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )

def install_observability(app: FastAPI) -> None:
    logger = logging.getLogger("uvicorn.error")

    @app.middleware("http")
    async def access_log(request: Request, call_next):
        start = time.time()
        try:
            resp = await call_next(request)
            status = resp.status_code
        except Exception as e:
            status = 500
            logger.exception("unhandled")
            return JSONResponse({"detail": str(e)}, status_code=500)
        latency_ms = int((time.time() - start) * 1000)
        logger.info(
            "access method=%s path=%s status=%s latency_ms=%s rid=%s client=%s",
            request.method, request.url.path, status, latency_ms,
            request.headers.get("x-request-id", "-"),
            request.client.host if request.client else "-",
        )
        return resp
