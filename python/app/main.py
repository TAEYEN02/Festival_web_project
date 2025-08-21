# app/main.py
import asyncio
import json
import logging
import os
from typing import Any, Dict
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

try:
    import redis.asyncio as redis  # redis-py 5.x (aioredis 통합)
except Exception:  # pragma: no cover
    redis = None  # Redis가 없어도 앱은 동작하도록

from app.config import settings
from app.ai import (
    TravelQuery,
    TravelRecResponse,
    get_travel_recommendations,
    query_fingerprint,
)
from app.observability import setup_logging, install_observability

logger = logging.getLogger("uvicorn.error")


def _parse_allowed_origins() -> list[str]:
    """
    CORS_ALLOW_ORIGINS 환경변수(콤마 구분)를 파싱합니다.
    비어 있으면 개발 편의상 ['*']로 간주합니다.
    """
    raw = os.getenv("CORS_ALLOW_ORIGINS", "")
    if not raw.strip():
        return ["*"]
    origins = [x.strip() for x in raw.split(",") if x.strip()]
    return origins or ["*"]


def _cors_params() -> dict:
    """
    정책:
    - CORS_ALLOW_ORIGINS가 비어 있거나 '*'를 포함하면:
      allow_origins=['*'], allow_credentials=False (표준 제약)
    - 구체 오리진만 있을 때:
      allow_origins=<목록>, allow_credentials=True
    """
    origins = _parse_allowed_origins()
    has_wildcard = any(o == "*" for o in origins)

    if has_wildcard:
        return {
            "allow_origins": ["*"],
            "allow_credentials": False,
            "allow_methods": ["*"],
            "allow_headers": ["*"],
        }
    else:
        return {
            "allow_origins": origins,
            "allow_credentials": True,
            "allow_methods": ["*"],
            "allow_headers": ["*"],
        }


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI 권장 방식(lifespan)으로 startup/shutdown 처리.
    - Redis 연결/검사 후 app.state.redis에 보관
    - 종료 시 연결 정리
    """
    # Startup
    app.state.redis = None
    if redis is None:
        logger.warning("redis 패키지가 없어 캐시를 비활성화합니다.")
    else:
        try:
            app.state.redis = redis.from_url(settings.redis_url, decode_responses=True)
            await app.state.redis.ping()
            logger.info("Redis 연결 성공: %s", settings.redis_url)
        except Exception as e:  # pragma: no cover
            app.state.redis = None
            logger.warning("Redis 연결 실패(캐시 비활성화): %s", e)

    yield

    # Shutdown
    r = getattr(app.state, "redis", None)
    if r is not None:
        try:
            await r.close()
        except Exception:  # pragma: no cover
            pass


def create_app() -> FastAPI:
    app = FastAPI(
        title="Travel Recs API",
        version=os.getenv("APP_VERSION", "0.1.0"),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # === Observability (로깅/미들웨어/예외 핸들러) ===
    setup_logging(os.getenv("LOG_LEVEL", "INFO"))
    install_observability(app)

    # === CORS ===
    app.add_middleware(CORSMiddleware, **_cors_params())

    # ===== 시스템/유틸 =====
    @app.get("/", tags=["system"])
    async def root() -> Dict[str, Any]:
        return {
            "name": "Travel Recs API",
            "version": app.version,
            "env": settings.env,
        }

    @app.get("/healthz", tags=["system"])
    async def healthz() -> Dict[str, Any]:
        r_ok = False
        if getattr(app.state, "redis", None) is not None:
            try:
                await app.state.redis.ping()
                r_ok = True
            except Exception:
                r_ok = False
        return {
            "ok": True,
            "redis": r_ok,
            "vertex_project": settings.vertex_project_id,
            "model": settings.vertex_model,
        }

    @app.get("/version", tags=["system"])
    async def version() -> Dict[str, str]:
        return {"version": app.version}

    @app.get("/api/travel/sample-query", tags=["travel"])
    async def sample_query() -> Dict[str, Any]:
        return {
            "origin": "Seoul, KR",
            "duration_days": 5,
            "budget_per_day_usd": 120,
            "companions": "couple",
            "travel_styles": ["food", "culture", "relax"],
            "months": [9, 10],
            "climate": "mild",
            "must_have": ["beach", "local food"],
            "avoid": ["extreme sports"],
            "language": "ko",
        }

    # ===== 핵심 추천 엔드포인트 =====
    @app.post(
        "/api/travel/recommend",
        response_model=TravelRecResponse,
        tags=["travel"],
        summary="여행지 추천 생성 (캐시 적용)",
    )
    async def travel_recommend(q: TravelQuery) -> TravelRecResponse:
        """
        동일 요청은 캐시에서 서빙합니다.
        """
        fp = query_fingerprint(q)
        key = f"travelrec:{fp}"

        # 1) 캐시 조회
        if getattr(app.state, "redis", None) is not None:
            try:
                cached = await app.state.redis.get(key)
                if cached:
                    try:
                        data = json.loads(cached)
                        return TravelRecResponse.model_validate(data)
                    except Exception:
                        pass
            except Exception as e:  # pragma: no cover
                logger.warning("Redis GET 실패: %s", e)

        # 2) 모델 호출 (블로킹이므로 쓰레드풀 실행)
        try:
            loop = asyncio.get_running_loop()
            rec: TravelRecResponse = await loop.run_in_executor(
                None, lambda: get_travel_recommendations(q)
            )
        except Exception as e:
            logger.exception("여행 추천 생성 실패")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"추천 생성에 실패했습니다: {e}",
            )

        # 3) 캐시에 저장
        if getattr(app.state, "redis", None) is not None:
            try:
                await app.state.redis.setex(
                    key,
                    settings.cache_ttl_seconds,
                    rec.model_dump_json(ensure_ascii=False),
                )
            except Exception as e:  # pragma: no cover
                logger.warning("Redis SETEX 실패: %s", e)

        return rec

    return app


app = create_app()


if __name__ == "__main__":
    # uvicorn 실행 (개발용)
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host=host, port=port, reload=os.getenv("RELOAD", "1") == "1")
