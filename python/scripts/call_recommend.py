# scripts/call_recommend.py
import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error

from dotenv import load_dotenv


def _to_list(csv: str | None) -> list[str] | None:
    if not csv:
        return None
    return [x.strip() for x in csv.split(",") if x.strip()]


def main() -> int:
    load_dotenv()  # .env 로부터 API_BASE_URL 등을 읽어옵니다.

    parser = argparse.ArgumentParser(
        description="Travel Recs API 호출 스크립트"
    )
    parser.add_argument(
        "--base-url",
        default=os.getenv("API_BASE_URL", "http://localhost:8000"),
        help="API 베이스 URL (기본: %(default)s)",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=float(os.getenv("API_TIMEOUT", "60")),
        help="요청 타임아웃 초 (기본: %(default)s)",
    )

    # 샘플 파라미터(필요한 것만 덮어쓰세요)
    parser.add_argument("--origin", default="Seoul, KR")
    parser.add_argument("--days", type=int, default=5, help="여행 기간(일)")
    parser.add_argument("--budget", type=int, default=120, help="일일 예산(USD)")
    parser.add_argument("--companions", default="couple", help="solo|couple|family|friends|group")
    parser.add_argument("--styles", default="food,culture,relax", help="콤마로 구분")
    parser.add_argument("--months", default="9,10", help="방문 예정 월(1~12), 콤마로 구분")
    parser.add_argument("--climate", default="mild", help="warm|mild|cold|dry|humid|doesn't matter")
    parser.add_argument("--must-have", dest="must_have", default="beach,local food", help="콤마로 구분")
    parser.add_argument("--avoid", default="extreme sports", help="콤마로 구분")
    parser.add_argument("--language", default="ko")

    args = parser.parse_args()

    endpoint = args.base_url.rstrip("/") + "/api/travel/recommend"

    payload: dict = {
        "origin": args.origin,
        "duration_days": args.days,
        "budget_per_day_usd": args.budget,
        "companions": args.companions,
        "travel_styles": _to_list(args.styles),
        "months": [int(x) for x in _to_list(args.months) or []] or None,
        "climate": args.climate,
        "must_have": _to_list(args.must_have),
        "avoid": _to_list(args.avoid),
        "language": args.language,
    }

    data_bytes = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        endpoint,
        data=data_bytes,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    print(f"[INFO] POST {endpoint}")
    print("[INFO] payload:", json.dumps(payload, ensure_ascii=False))

    start = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=args.timeout) as resp:
            status = resp.status
            body = resp.read().decode("utf-8", errors="replace")
            elapsed = (time.perf_counter() - start) * 1000
            print(f"[OK] status={status} latency_ms={int(elapsed)}")
            try:
                parsed = json.loads(body)
                print(json.dumps(parsed, indent=2, ensure_ascii=False))
            except json.JSONDecodeError:
                print(body)
            return 0
    except urllib.error.HTTPError as e:
        elapsed = (time.perf_counter() - start) * 1000
        err_body = e.read().decode("utf-8", errors="replace")
        print(f"[HTTP {e.code}] latency_ms={int(elapsed)}")
        print(err_body)
        return 2
    except urllib.error.URLError as e:
        elapsed = (time.perf_counter() - start) * 1000
        print(f"[NETERR] {e} latency_ms={int(elapsed)}")
        print("서버가 실행 중인지, 포트/방화벽/CORS 설정을 확인하세요.")
        return 3
    except Exception as e:
        elapsed = (time.perf_counter() - start) * 1000
        print(f"[ERROR] {e} latency_ms={int(elapsed)}")
        return 4


if __name__ == "__main__":
    sys.exit(main())
