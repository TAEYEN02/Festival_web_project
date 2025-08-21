# Travel Recs API (FastAPI + Vertex AI + Redis)

사용자 조건(예산/기간/스타일/동행/계절 등)에 맞춰 **여행지 추천**을 생성하는 백엔드 API입니다.  
- Framework: **FastAPI**
- LLM: **Google Vertex AI (Gemini)**
- Cache: **Redis** (없어도 실행 가능)
- 테스트: **pytest**

---

## 1) 요구 사항

- Python 3.10+ 권장
- (선택) Redis 5.x 이상
- GCP 프로젝트 + Vertex AI 사용 권한
- 서비스 계정 키(JSON) 파일

---

## 2) 빠른 시작(Quickstart)

### 가상환경 & 설치
```bash
python -m venv .venv
# Windows
.\.venv\Scripts\Activate.ps1

python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
