# tabs: 4
import asyncio
import json
import logging
import os
from typing import Any, Dict
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status, Response
from fastapi.middleware.cors import CORSMiddleware

try:
    import redis.asyncio as redis
except Exception:
    redis = None  # type: ignore

from app.config import settings
from app.ai import (
    TravelQuery, TravelRecResponse, get_travel_recommendations, query_fingerprint,
    PlanRequest, ItineraryPlanResponse, get_itinerary_plan,
)
from app.observability import setup_logging, install_observability

logger = logging.getLogger("uvicorn.error")

def _parse_allowed_origins() -> list[str]:
    raw = os.getenv("CORS_ALLOW_ORIGINS", "")
    if not raw.strip():
        return ["*"]
    origins = [x.strip() for x in raw.split(",") if x.strip()]
    return origins or ["*"]

def _cors_params() -> dict:
    origins = _parse_allowed_origins()
    has_wildcard = any(o == "*" for o in origins)
    base = {
        "allow_methods": ["*"],
        "allow_headers": ["*"],
        "expose_headers": ["X-Cache", "X-Cache-Key", "X-AI-Mode"],
    }
    if has_wildcard:
        return {**base, "allow_origins": ["*"], "allow_credentials": False}
    else:
        return {**base, "allow_origins": origins, "allow_credentials": True}

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis = None
    if redis is None:
        logger.warning("redis 패키지 없음. 캐시 비활성화.")
    else:
        try:
            app.state.redis = redis.from_url(settings.redis_url, decode_responses=True)
            await app.state.redis.ping()
            logger.info("Redis 연결 성공: %s", settings.redis_url)
        except Exception as e:
            app.state.redis = None
            logger.warning("Redis 연결 실패: %s", e)
    yield
    if getattr(app.state, "redis", None) is not None:
        try:
            await app.state.redis.close()
        except Exception:
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
    setup_logging(os.getenv("LOG_LEVEL", "INFO"))
    install_observability(app)
    app.add_middleware(CORSMiddleware, **_cors_params())

    @app.get("/", tags=["system"])
    async def root() -> Dict[str, Any]:
        return {"name": "Travel Recs API", "version": app.version, "env": settings.env}

    @app.get("/healthz", tags=["system"])
    async def healthz() -> Dict[str, Any]:
        r_ok = False
        if getattr(app.state, "redis", None) is not None:
            try:
                await app.state.redis.ping()
                r_ok = True
            except Exception:
                r_ok = False
        cred = bool(settings.google_credentials)
        return {
            "ok": True,
            "redis": r_ok,
            "vertex_project": settings.vertex_project_id,
            "model": settings.vertex_model,
            "creds": cred,
        }

    @app.get("/version", tags=["system"])
    async def version() -> Dict[str, str]:
        return {"version": app.version}

    @app.post(
        "/api/travel/recommend",
        response_model=TravelRecResponse,
        tags=["travel"],
        summary="여행지 추천 생성 (캐시 적용)",
    )
    async def travel_recommend(q: TravelQuery, response: Response) -> TravelRecResponse:
        ai_mode = "VERTEX"
        response.headers["X-AI-Mode"] = ai_mode

        fp = query_fingerprint(q)
        key = f"travelrec:{fp}"
        response.headers["X-Cache-Key"] = key

        if getattr(app.state, "redis", None) is None:
            response.headers["X-Cache"] = "DISABLED"
        else:
            try:
                cached = await app.state.redis.get(key)
                if cached:
                    try:
                        data = json.loads(cached)
                        response.headers["X-Cache"] = "HIT"
                        return TravelRecResponse.model_validate(data)
                    except Exception:
                        pass
            except Exception as e:
                logger.warning("Redis GET 실패: %s", e)

        try:
            loop = asyncio.get_running_loop()
            rec: TravelRecResponse = await loop.run_in_executor(
                None, lambda: get_travel_recommendations(q)
            )
            if response.headers.get("X-Cache") != "DISABLED":
                response.headers["X-Cache"] = "MISS"
        except Exception as e:
            logger.exception("여행 추천 생성 실패")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"추천 생성에 실패했습니다: {e}",
            )

        if getattr(app.state, "redis", None) is not None:
            try:
                json_str = json.dumps(rec.model_dump(mode="json"), ensure_ascii=False)
                await app.state.redis.setex(key, settings.cache_ttl_seconds, json_str)
            except Exception as e:
                logger.warning("Redis SETEX 실패: %s", e)

        return rec

    @app.post(
        "/api/ai/itinerary",
        response_model=ItineraryPlanResponse,
        tags=["itinerary"],
        summary="위저드 입력 → 일정 생성",
    )
    async def ai_itinerary(req: PlanRequest, response: Response) -> ItineraryPlanResponse:
        response.headers["X-AI-Mode"] = "VERTEX"
        try:
            loop = asyncio.get_running_loop()
            plan: ItineraryPlanResponse = await loop.run_in_executor(
                None, lambda: get_itinerary_plan(req)
            )
            return plan
        except Exception as e:
            logger.exception("일정 생성 실패")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"일정 생성에 실패했습니다: {e}",
            )

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host=host, port=port, reload=os.getenv("RELOAD", "1") == "1")
