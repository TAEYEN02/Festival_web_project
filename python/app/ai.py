# tabs: 4
# app/ai.py — FAKE 제거, Vertex만 사용
import json
import hashlib
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from app.config import settings

# ============ 공용 유틸 ============
def _yyyymmdd_to_iso(s: Optional[str]) -> str:
    if not s or len(s) != 8:
        return s or ""
    return f"{s[:4]}-{s[4:6]}-{s[6:8]}"

def _parse_date(s: str) -> Optional[datetime]:
    for fmt in ("%Y-%m-%d", "%Y%m%d"):
        try:
            return datetime.strptime(s, fmt)
        except Exception:
            pass
    return None

def _init_vertex_model():
    try:
        import vertexai as vx
        from vertexai.generative_models import GenerativeModel
    except Exception as e:
        raise RuntimeError(f"vertexai 패키지 미설치: {e}")
    if not settings.vertex_project_id or not settings.vertex_model:
        raise RuntimeError("VERTEX_PROJECT_ID 또는 VERTEX_MODEL 미설정")
    vx.init(project=settings.vertex_project_id, location=settings.vertex_location)
    return GenerativeModel(model_name=settings.vertex_model)

# ============ 여행지 추천 ============
class TravelQuery(BaseModel):
    origin: Optional[str] = Field(None)
    duration_days: Optional[int] = Field(None, ge=1, le=60)
    budget_per_day_usd: Optional[int] = Field(None, ge=10, le=2000)
    companions: Optional[str] = Field(None)
    travel_styles: Optional[List[str]] = Field(default=None)
    months: Optional[List[int]] = Field(default=None)
    climate: Optional[str] = Field(default=None)
    must_have: Optional[List[str]] = Field(default=None)
    avoid: Optional[List[str]] = Field(default=None)
    language: Optional[str] = Field(default="ko")

class ItineraryItem(BaseModel):
    day: int
    title: str
    activities: List[str]
    notes: Optional[str] = None

class Destination(BaseModel):
    name: str
    country: Optional[str] = None
    summary: str
    best_time: Optional[str] = None
    highlights: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    est_budget_per_day_usd: Optional[int] = None

class TravelRecResponse(BaseModel):
    top_pick: Destination
    alternatives: List[Destination] = Field(default_factory=list)
    itinerary: List[ItineraryItem] = Field(default_factory=list)
    rationale: str

def _build_system_prompt(language: str = "ko") -> str:
    return "역할: 여행 큐레이터. 조건을 분석해 현실적 추천을 제공하고 JSON만 출력하라."

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
    return "조건:\n" + "\n".join(parts)

def query_fingerprint(q: TravelQuery) -> str:
    payload_dict = q.model_dump(mode="json", exclude_none=True)
    stable_json = json.dumps(payload_dict, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(stable_json.encode("utf-8")).hexdigest()

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

def get_travel_recommendations(q: TravelQuery) -> TravelRecResponse:
    model = _init_vertex_model()
    from vertexai.generative_models import GenerationConfig
    system_prompt = _build_system_prompt(q.language or "ko")
    user_prompt = _build_user_prompt(q)
    gen_config = GenerationConfig(
        temperature=0.6,
        top_p=0.9,
        max_output_tokens=2048,
        response_mime_type="application/json",
        response_schema=_RESPONSE_SCHEMA,
    )
    resp = model.generate_content(
        [system_prompt, user_prompt, "JSON만 출력하라. 허구의 출처 금지."],
        generation_config=gen_config,
    )
    raw = getattr(resp, "text", "") or getattr(resp, "output_text", "")
    if not raw:
        cand = (getattr(resp, "candidates", None) or [None])[0]
        if cand and getattr(cand, "content", None):
            parts = getattr(cand.content, "parts", [])
            if parts and hasattr(parts[0], "text"):
                raw = parts[0].text
    if not raw:
        raise RuntimeError("Vertex 응답 비어 있음")

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        cleaned = raw.strip().strip("`")
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()
        data = json.loads(cleaned)

    return TravelRecResponse.model_validate(data)

# ============ 위저드 일정 생성 ============
class Place(BaseModel):
    name: Optional[str] = ""
    address: Optional[str] = ""
    lat: Optional[float] = None
    lng: Optional[float] = None

class WizardDestination(BaseModel):
    title: Optional[str] = ""
    addr1: Optional[str] = ""
    mapx: Optional[float] = None
    mapy: Optional[float] = None
    contentid: Optional[str] = ""
    eventstartdate: Optional[str] = ""
    eventenddate: Optional[str] = ""
    firstimage: Optional[str] = ""

class Preferences(BaseModel):
    contentTypeIds: List[int] = []

class Options(BaseModel):
    people: Optional[int] = 2
    startDate: Optional[str] = ""
    endDate: Optional[str] = ""
    days: Optional[int] = 0
    tempo: Optional[str] = "relaxed"
    gapMinutes: Optional[int] = 90
    stopsPerDay: Optional[int] = 3

class PlanRequest(BaseModel):
    origin: Place
    destination: WizardDestination
    preferences: Optional[Preferences] = Preferences()
    options: Optional[Options] = Options()

class ItineraryStop(BaseModel):
    time: str
    name: str
    type: int
    address: str
    notes: Optional[str] = ""

class ItineraryDay(BaseModel):
    day: int
    date: str
    stops: List[ItineraryStop]

class ItineraryPlanResponse(BaseModel):
    title: str
    days: int
    summary: str
    daily: List[ItineraryDay]
    notes: Optional[str] = ""

_ITINERARY_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "days": {"type": "integer"},
        "summary": {"type": "string"},
        "daily": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "day": {"type": "integer"},
                    "date": {"type": "string"},
                    "stops": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "time": {"type": "string"},
                                "name": {"type": "string"},
                                "type": {"type": "integer"},
                                "address": {"type": "string"},
                                "notes": {"type": "string"},
                            },
                            "required": ["time", "name", "type", "address"]
                        },
                    },
                },
                "required": ["day", "date", "stops"]
            },
        },
        "notes": {"type": "string"},
    },
    "required": ["title", "days", "summary", "daily"],
    "additionalProperties": False,
}

def _build_itinerary_user_prompt(req: PlanRequest) -> str:
    o = req.origin
    d = req.destination
    p = req.preferences or Preferences()
    opt = req.options or Options()
    return (
        "역할: 한국 여행 일정 플래너. JSON만 출력.\n"
        '스키마: {"title":string,"days":number,"summary":string,'
        '"daily":[{"day":number,"date":string,"stops":[{"time":string,"name":string,"type":number,"address":string,"notes":string}]}],"notes":string}\n\n'
        "입력:\n"
        f"- 출발지: {o.name or ''} / {o.address or ''} / 좌표({o.lat},{o.lng})\n"
        f"- 도착지(축제): {d.title or ''} / {d.addr1 or ''} / 좌표({d.mapy},{d.mapx})\n"
        f"- 축제기간: {_yyyymmdd_to_iso(d.eventstartdate or '')} ~ {_yyyymmdd_to_iso(d.eventenddate or '')}\n"
        f"- 선호 타입: {p.contentTypeIds}\n"
        f"- 인원: {opt.people}, 기간: {opt.startDate} ~ {opt.endDate} ({opt.days}일)\n"
        f"- 스타일: {opt.tempo}, 텀: {opt.gapMinutes}분, 코스/일: {opt.stopsPerDay}\n\n"
        "요구사항: 09:00~21:00 내 배치. 축제일엔 축제 중심. 이동 간격 반영. JSON 하나만."
    )

def get_itinerary_plan(req: PlanRequest) -> ItineraryPlanResponse:
    model = _init_vertex_model()
    from vertexai.generative_models import GenerationConfig
    gen_conf = GenerationConfig(
        temperature=0.5,
        top_p=0.9,
        max_output_tokens=2048,
        response_mime_type="application/json",
        response_schema=_ITINERARY_SCHEMA,
    )
    resp = model.generate_content(
        ["역할: 여행 일정 생성기. JSON만 출력.", _build_itinerary_user_prompt(req), "JSON 하나만 출력."],
        generation_config=gen_conf,
    )
    raw = getattr(resp, "text", "") or getattr(resp, "output_text", "")
    if not raw:
        cand = (getattr(resp, "candidates", None) or [None])[0]
        if cand and getattr(cand, "content", None):
            parts = getattr(cand.content, "parts", [])
            if parts and hasattr(parts[0], "text"):
                raw = parts[0].text
    if not raw:
        raise RuntimeError("Vertex 응답 비어 있음")

    try:
        data = json.loads(raw.strip().strip("`").replace("json\n", ""))
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Vertex JSON 파싱 실패: {e}")

    return ItineraryPlanResponse.model_validate(data)
