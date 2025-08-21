# app/config.py
import os
from dataclasses import dataclass
from typing import Optional

from dotenv import load_dotenv

# .env 로드 (프로젝트 루트에 .env 파일이 있다고 가정)
load_dotenv()


@dataclass(frozen=True)
class Settings:
    # === Vertex AI / GCP ===
    vertex_project_id: str
    vertex_location: str
    vertex_model: str
    google_app_credentials: Optional[str]

    # === Redis Cache ===
    redis_url: str
    cache_ttl_seconds: int

    # === JWT (추후 보호가 필요한 엔드포인트에 사용) ===
    jwt_secret: Optional[str]
    jwt_expire_minutes: int

    # === 기타 ===
    env: str


def _get_env_str(key: str, default: Optional[str] = None, required: bool = False) -> str:
    value = os.getenv(key, default if default is not None else "")
    if required and not value:
        raise RuntimeError(f"Required environment variable '{key}' is missing")
    return value


def _get_env_int(key: str, default: int) -> int:
    raw = os.getenv(key, "")
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        raise RuntimeError(f"Environment variable '{key}' must be an integer (got: {raw})")


def load_settings() -> Settings:
    """
    .env 값을 읽어 Settings 인스턴스를 반환합니다.
    필수 값이 없으면 예외를 발생시켜 부팅 단계에서 잡히도록 합니다.
    """
    return Settings(
        # Vertex AI / GCP
        vertex_project_id=_get_env_str("VERTEX_PROJECT_ID", required=True),
        vertex_location=_get_env_str("VERTEX_LOCATION", default="us-central1"),
        vertex_model=_get_env_str("VERTEX_MODEL", default="gemini-1.5-flash"),
        google_app_credentials=_get_env_str("GOOGLE_APPLICATION_CREDENTIALS", default=None),

        # Redis
        redis_url=_get_env_str("REDIS_URL", default="redis://localhost:6379/0"),
        cache_ttl_seconds=_get_env_int("CACHE_TTL_SECONDS", default=7 * 24 * 3600),

        # JWT
        jwt_secret=_get_env_str("JWT_SECRET", default=None),
        jwt_expire_minutes=_get_env_int("JWT_EXPIRE_MINUTES", default=60),

        # 기타
        env=_get_env_str("APP_ENV", default="local"),
    )


# 애플리케이션 어디서든 import 해서 재사용
settings = load_settings()
