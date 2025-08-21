# app/ai.py
import json
import hashlib
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, ValidationError
import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig

from app.config import settings


# =========================
# Pydantic: 입력/출력 스키마
# =========================
class TravelQuery(BaseModel):
    """
    여행지 추천을 위한 사용자의 선호/제약 조건.
    프론트엔드에서 이 스키마대로 넘기면 그대로 사용 가능합니다.
    """
    origin: Optional[str] = Field(None, description="출발 국가/도시 예: 'Seoul, KR'")
    duration_days: Optional[int] = Field(None, ge=1, le=60, description="여행 기간(일)")
    budget_per_day_usd: Optional[int] = Field(None, ge=10, le=2000, description="일일 예산(USD)")
    companions: Optional[str] = Field(None, description="동행 형태: solo | couple | family | friends | group")
    travel_styles: Optional[List[str]] = Field(
        default=None,
        description="여행 스타일 태그: ['nature','culture','food','nightlife','relax','adventure','shopping','photography'] 등"
    )
    months: Optional[List[int]] = Field(
        default=None,
        description="여행 예정 월(1~12). 비우면 '연중' 가정"
    )
    climate: Optional[str] = Field(
        default=None,
        description="선호 기후: warm | mild | cold | dry | humid | doesn't matter"
    )
    must_have: Optional[List[str]] = Field(
        default=None,
        description="꼭 포함할 요소 키워드(예: 'beach','mountain','museum','local food')"
    )
    avoid: Optional[List[str]] = Field(
        default=None,
        description="피하고 싶은 요소 키워드(예: 'extreme sports','long hikes','spicy food')"
    )
    language: Optional[str] = Field(default="ko", description="응답 언어. 기본 'ko'.")


class ItineraryItem(BaseModel):
    day: int = Field(..., ge=1)
    title: str
    activities: List[str]
    notes: Optional[str] = None


class Destination(BaseModel):
    name: str
    country: Optional[str] = None
    summary: str
    best_time: Optional[str] = Field(
        default=None,
        description="방문 최적 시기(월/시즌)"
    )
    highlights: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    est_budget_per_day_usd: Optional[int] = None


class TravelRecResponse(BaseModel):
    """
    모델이 반드시 이 JSON 스키마로 응답하도록 유도합니다.
    """
    top_pick: Destination
    alternatives: List[Destination] = Field(default_factory=list, description="최대 4개 정도")
    itinerary: List[ItineraryItem] = Field(default_factory=list, description="top_pick 기준 2~5일 샘플 일정")
    rationale: str


# =========================
# Vertex AI 초기화 & 모델
# =========================
vertexai.init(project=settings.vertex_project_id, location=settings.vertex_location)

# 모델 이름은 .env 의 VERTEX_MODEL (기본: gemini-1.5-flash)
_MODEL = GenerativeModel(model_name=settings.vertex_model)

# JSON 스키마(dict) — vertexai 의 response_schema 로 전달
_RESPONSE_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "top_pick": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "country": {"type": "string"},
                "summary": {"type": "string"},
                "best_time": {"type": "string"},
                "highlights": {"type": "array", "items": {"type": "string"}},
                "tags": {"type": "array", "items": {"type": "string"}},
                "est_budget_per_day_usd": {"type": "integer"},
            },
            "required": ["name", "summary", "highlights", "tags"]
        },
        "alternatives": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "country": {"type": "string"},
                    "summary": {"type": "string"},
                    "best_time": {"type": "string"},
                    "highlights": {"type": "array", "items": {"type": "string"}},
                    "tags": {"type": "array", "items": {"type": "string"}},
                    "est_budget_per_day_usd": {"type": "integer"},
                },
                "required": ["name", "summary", "highlights", "tags"]
            }
        },
        "itinerary": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "day": {"type": "integer"},
                    "title": {"type": "string"},
                    "activities": {"type": "array", "items": {"type": "string"}},
                    "notes": {"type": "string"},
                },
                "required": ["day", "title", "activities"]
            }
        },
        "rationale": {"type": "string"},
    },
    "required": ["top_pick", "rationale"],
    "additionalProperties": False,
}


# =========================
# Prompt 빌드
# =========================
def _build_system_prompt(language: str = "ko") -> str:
    if language == "ko":
        return (
            "역할: 당신은 여행 큐레이터입니다. 사용자의 조건을 분석해 현실적이고 구체적인 여행 추천을 제공합니다. "
            "예산·기간·동행·스타일을 고려하고, 안전하고 일반적 신뢰 가능한 정보를 기준으로 제안하세요. "
            "응답은 반드시 JSON으로만 출력하세요."
        )
    # 기본 한국어
    return _build_system_prompt("ko")


def _build_user_prompt(q: TravelQuery) -> str:
    parts = [
        f"- 출발지: {q.origin or '미지정'}",
        f"- 기간: {q.duration_days or '미지정'}일",
        f"- 일일 예산(USD): {q.budget_per_day_usd or '미지정'}",
        f"- 동행: {q.companions or '미지정'}",
        f"- 스타일: {', '.join(q.travel_styles or []) or '미지정'}",
        f"- 예정 월: {', '.join(map(str, q.months or [])) or '미지정'}",
        f"- 선호 기후: {q.climate or '미지정'}",
        f"- 반드시 포함: {', '.join(q.must_have or []) or '없음'}",
        f"- 피하고 싶은 것: {', '.join(q.avoid or []) or '없음'}",
        f"- 응답 언어: {q.language or 'ko'}",
    ]
    return "다음 조건에 맞게 여행지를 추천해 주세요:\n" + "\n".join(parts)


# =========================
# 해시 키 (캐시용)
# =========================
def query_fingerprint(q: TravelQuery) -> str:
    """
    Pydantic v2: model_dump_json(sort_keys=...) 미지원.
    dict로 덤프 후 json.dumps(..., sort_keys=True)로 안정적 해시를 생성.
    """
    payload_dict = q.model_dump(mode="json", exclude_none=True)
    stable_json = json.dumps(payload_dict, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(stable_json.encode("utf-8")).hexdigest()


# =========================
# 호출 함수 (핵심)
# =========================
def get_travel_recommendations(q: TravelQuery) -> TravelRecResponse:
    """
    Vertex AI(Gemini)로부터 여행지 추천을 받아
    TravelRecResponse 스키마로 파싱하여 반환합니다.
    """
    system_prompt = _build_system_prompt(q.language or "ko")
    user_prompt = _build_user_prompt(q)

    gen_config = GenerationConfig(
        temperature=0.6,
        top_p=0.9,
        max_output_tokens=2048,
        response_mime_type="application/json",
        response_schema=_RESPONSE_SCHEMA,
    )

    response = _MODEL.generate_content(
        [
            system_prompt,
            user_prompt,
            (
                "출력은 반드시 위 스키마를 준수하는 JSON이어야 합니다. "
                "facts에 자신 없거나 변동성이 큰 세부 정보(가격/운영시간/특가 등)는 일반화하여 표현하세요. "
                "허구의 출처를 만들지 마세요."
            ),
        ],
        generation_config=gen_config,
    )

    raw_text: Optional[str] = None
    try:
        raw_text = getattr(response, "text", None)
        if not raw_text:
            cand = (response.candidates or [None])[0]
            if cand and getattr(cand, "content", None):
                parts = getattr(cand.content, "parts", [])
                if parts and hasattr(parts[0], "text"):
                    raw_text = parts[0].text
    except Exception:
        raw_text = None

    if not raw_text:
        raw_text = getattr(response, "output_text", "")

    if not raw_text:
        raise RuntimeError("모델 응답이 비어 있습니다.")

    # JSON 파싱 & 유효성 검사
    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError:
        cleaned = raw_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()
        data = json.loads(cleaned)

    try:
        validated = TravelRecResponse.model_validate(data)
    except ValidationError as e:
        snippet = raw_text[:400]
        raise RuntimeError(f"모델 응답이 스키마에 맞지 않습니다: {e}\nraw: {snippet}")

    return validated


# =========================
# 모듈 단독 실행 테스트
# =========================
if __name__ == "__main__":
    sample = TravelQuery(
        origin="Seoul, KR",
        duration_days=5,
        budget_per_day_usd=120,
        companions="couple",
        travel_styles=["food", "culture", "relax"],
        months=[9, 10],
        climate="mild",
        must_have=["beach", "local food"],
        avoid=["extreme sports"],
        language="ko",
    )
    print("fingerprint:", query_fingerprint(sample))
    rec = get_travel_recommendations(sample)
    print(json.dumps(rec.model_dump(mode="json"), indent=2, ensure_ascii=False))
