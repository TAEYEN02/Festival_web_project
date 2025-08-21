# Travel Recs API (FastAPI + Vertex AI + Redis)

사용자 조건(예산/기간/스타일/동행/계절 등)에 맞춰 **여행지 추천**을 생성하는 백엔드 API입니다.  
- Framework: **FastAPI**
- LLM: **Google Vertex AI (Gemini)**
- Cache: **Redis** *(없어도 실행 가능)*
- Test: **pytest**
- Dev notes: **Docker 안 씀**, **Vite 안 씀**

---

## 요구 사항

- Python **3.10+** (3.11/3.12/3.13 호환)
- (선택) **Redis 5.x+**
- GCP 프로젝트 + **Vertex AI 권한**
- 서비스 계정 키(JSON) 파일

---

## 빠른 시작 (Quickstart)

### 1) 가상환경 생성 & 활성화
```bash
# 프로젝트 루트에서
python -m venv .venv
```

**Windows – PowerShell**
```powershell
.\.venv\Scripts\Activate.ps1
```

**Windows – CMD**
```bat
.\.venv\Scriptsctivate.bat
```

**macOS / Linux**
```bash
source .venv/bin/activate
```

### 2) 패키지 설치
```bash
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### 3) 환경변수(.env) 준비
루트에 **.env** 파일을 만들고 아래를 참고해 값 채우기(또는 `.env.example`을 복사):

```ini
# 실행 환경
ENV=local
LOG_LEVEL=INFO

# 프런트 CORS (필요 오리진 추가)
CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# 개발 중 빠른 연동 확인용 (1이면 모델 호출 없이 샘플 응답 반환)
FAKE_AI=0

# Vertex AI
VERTEX_PROJECT_ID=your-gcp-project-id
VERTEX_LOCATION=global
VERTEX_MODEL=gemini-2.0-flash-001

# GCP 서비스 계정 키(절대경로 권장)
# Windows: C:\Users\me\keys\svc.json
# macOS/Linux: /Users/me/keys/svc.json
GOOGLE_APPLICATION_CREDENTIALS=C:\absolute\path\to\service-account.json

# (선택) Redis — 없으면 캐시 비활성 상태로 동작
REDIS_URL=redis://localhost:6379/0
CACHE_TTL_SECONDS=86400
```

> 참고  
> • `CORS_ALLOW_ORIGINS`를 비우거나 `*`를 넣으면 와일드카드 허용(자격 증명 자동 비활성).  
> • 지연이 크면 **FAKE_AI=1**로 먼저 프런트–백 연동 확인 후, 실제 모델로 전환.

### 4) 서버 실행
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- 문서 UI: http://localhost:8000/docs  
- Redoc: http://localhost:8000/redoc

---

## API 요약

### 헬스체크
```
GET /healthz
```

### 샘플 요청 스키마
```
GET /api/travel/sample-query
```

### 여행 추천 생성
```
POST /api/travel/recommend
Content-Type: application/json
```

**예시 요청(JSON)**
```json
{
  "origin": "Seoul, KR",
  "duration_days": 5,
  "budget_per_day_usd": 120,
  "companions": "couple",
  "travel_styles": ["food", "culture", "relax"],
  "months": [9, 10],
  "climate": "mild",
  "must_have": ["beach", "local food"],
  "avoid": ["extreme sports"],
  "language": "ko"
}
```

**cURL**
```bash
curl -X POST "http://localhost:8000/api/travel/recommend" ^
  -H "Content-Type: application/json" ^
  -d "{\"origin\":\"Seoul, KR\",\"duration_days\":5,\"budget_per_day_usd\":120,\"companions\":\"couple\",\"travel_styles\":[\"food\",\"culture\",\"relax\"],\"months\":[9,10],\"climate\":\"mild\",\"must_have\":[\"beach\",\"local food\"],\"avoid\":[\"extreme sports\"],\"language\":\"ko\"}"
```

---

## 캐시 동작 (선택)

- Redis 연결 시 동일 페이로드는 **TTL** 동안 캐시 **HIT**.
- Redis 미사용이어도 API는 정상 동작(캐시 비활성).

> 선택: 캐시 상태를 프런트에서 보고 싶다면 서버가 응답 헤더  
> `X-Cache`, `X-Cache-Key`, `X-AI-Mode`를 노출하도록 구성하고(예: CORS `expose_headers`),  
> 프런트에서 해당 헤더를 읽어 콘솔/배지로 표시할 수 있습니다.

---

## Vertex AI 설정 팁

- 권장 모델: `gemini-2.0-flash-001`  
- 리전: `global` (또는 프로젝트에서 지원되는 리전)  
- 서비스 계정 권한: **Vertex AI User** (필요 시 추가)  
- Windows는 서비스 키 경로를 **절대경로**로 지정하세요.

---

## 트러블슈팅

- **`ModuleNotFoundError: No module named 'fastapi'`**  
  → 가상환경 활성화 후 `pip install -r requirements.txt`.

- **CORS 에러 (`No 'Access-Control-Allow-Origin'`)**  
  → `.env`의 `CORS_ALLOW_ORIGINS`에 프런트 오리진 추가(`http://localhost:3000` 등).  
  → 와일드카드(`*`) 사용 시 자격 증명은 비활성.

- **`404 Publisher Model ... was not found`**  
  → `VERTEX_PROJECT_ID`/`VERTEX_LOCATION`/`VERTEX_MODEL` 정확도 및 권한 확인.  
  → 서비스 계정 권한과 `GOOGLE_APPLICATION_CREDENTIALS` 경로 점검.

- **`Request timeout`**  
  → 첫 호출/콜드스타트 및 구조화 출력 시 지연 가능. 프런트 타임아웃을 30~45초로.  
  → 임시로 `FAKE_AI=1`로 빠르게 연동 확인.

- **Redis 관련 경고/오류**  
  → Redis 미사용이면 무시 가능. 사용 시 `REDIS_URL` 확인.

---

## 프로젝트 구조
```
app/
    main.py               # FastAPI 엔트리포인트
    ai.py                 # 스키마/프롬프트/Vertex 호출
    config.py             # 설정(.env 로딩)
    observability.py      # 로깅/미들웨어
tests/
    ...                   # pytest (선택)
requirements.txt
.env                      # 환경변수 (로컬)
```

---

## 개발 워크플로 (요약)

1) 가상환경 활성화  
   - PowerShell: `.\.venv\Scripts\Activate.ps1`  
   - CMD: `.\.venv\Scriptsctivate.bat`  
   - macOS/Linux: `source .venv/bin/activate`  
2) 의존성 설치: `pip install -r requirements.txt`  
3) `.env` 구성(필요 시 `FAKE_AI=1`)  
4) 서버 기동: `python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`  
5) `http://localhost:8000/docs` 확인  
6) 프런트에서 `/api/travel/recommend` 호출 및 캐시 동작 확인

즐거운 개발! 🚀
