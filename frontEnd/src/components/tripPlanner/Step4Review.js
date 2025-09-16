import { useEffect, useMemo, useState } from "react";
import { createItinerary } from "./api/aiClient";
import { saveItinerary } from "../../api/mypage";
import "./Step4Review.css";

/**
 * props:
 *  - data = { origin, destination, preferences, options }
 *  - onPrev: () => void
 *  - onFinish: () => void
 */
export default function Step4Review({ data, onPrev, onFinish }) {
  const [ai, setAi] = useState({ loading: true, error: "", plan: null });
  const [saving, setSaving] = useState(false);
  const [nearby, setNearby] = useState({ loading: true, error: "", items: [] });

  // AI 일정 생성
  useEffect(() => {
    const ac = new AbortController();
    setAi({ loading: true, error: "", plan: null });
    (async () => {
      try {
        const res = await createItinerary(data, ac.signal);
        const plan = res?.plan || res;
        setAi({ loading: false, error: "", plan });
      } catch {
        setAi({ loading: false, error: "AI 호출 실패", plan: null });
      }
    })();
    return () => ac.abort();
  }, [data]);

  // 주변 후보 조회
  useEffect(() => {
    const ac = new AbortController();

    const dest = data?.destination || {};
    const lat = Number(dest.lat ?? dest.mapy);
    const lng = Number(dest.lng ?? dest.mapx);
    const contentTypes = (data?.preferences?.contentTypeIds?.length
      ? data.preferences.contentTypeIds
      : [15, 12, 39]
    ).map(String);
    const serviceKey = decodeURIComponent(process.env.REACT_APP_TOURAPI_KEY || "");

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setNearby({ loading: false, error: "도착지 좌표 없음", items: [] });
      return;
    }
    if (!serviceKey) {
      setNearby({ loading: false, error: "REACT_APP_TOURAPI_KEY 누락", items: [] });
      return;
    }

    const radius = 2000;
    const common = {
      serviceKey,
      MobileOS: "WEB",
      MobileApp: "festivalGo",
      _type: "json",
      arrange: "E",
      mapX: String(lng),
      mapY: String(lat),
      radius: String(radius),
      numOfRows: "30",
      pageNo: "1",
    };

    const fetchOne = async (ct) => {
      const params = new URLSearchParams({ ...common, contentTypeId: ct });
      const url = `https://apis.data.go.kr/B551011/KorService2/locationBasedList2?${params.toString()}`;
      const resp = await fetch(url, { signal: ac.signal });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      const list = json?.response?.body?.items?.item || [];
      return list.map((it) => ({
        id: String(it.contentid),
        name: it.title || "",
        address: it.addr1 || "",
        imageUrl: it.firstimage || it.firstimage2 || "",
        lat: Number(it.mapy),
        lng: Number(it.mapx),
        dist: Number(it.dist || "0"),
        type: String(it.contenttypeid || ct),
      }));
    };

    (async () => {
      setNearby((s) => ({ ...s, loading: true, error: "" }));
      try {
        const chunks = await Promise.allSettled(contentTypes.map(fetchOne));
        const merged = chunks.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);
        const map = new Map();
        for (const it of merged) if (!map.has(it.id)) map.set(it.id, it);
        const items = Array.from(map.values()).sort((a, b) => a.dist - b.dist).slice(0, 30);
        setNearby({ loading: false, error: "", items });
      } catch {
        if (ac.signal.aborted) return;
        setNearby({ loading: false, error: "주변 후보 조회 실패", items: [] });
      }
    })();

    return () => ac.abort();
  }, [data]);

  const prefText = useMemo(() => {
    const ids = data?.preferences?.contentTypeIds || [];
    if (!ids.length) return "-";
    const map = { 12: "관광지", 14: "문화시설", 15: "축제/공연/행사", 25: "여행코스", 28: "레포츠", 32: "숙박", 38: "쇼핑", 39: "음식점" };
    return ids.map((id) => map[id] || id).join(", ");
  }, [data]);

  if (ai.loading) {
    return (
      <div className="sr4 sr4-wrap">
        <h2>일정 생성 중…</h2>
        <div className="sr4-loader">
          <div className="sr4-spin" />
          <div className="sr4-hint" style={{ marginTop: 12 }}>AI가 추천 일정을 생성하고 있습니다</div>
        </div>
      </div>
    );
  }

  const o = data?.origin || {};
  const d = data?.destination || {};
  const f = d.meta?.rawFestival || d.meta || {};
  const plan = ai.plan && typeof ai.plan === "object" ? ai.plan : null;
  const daysArr = Array.isArray(plan?.daily) ? plan.daily : [];

  const handleFinish = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!plan) {
      alert("AI 일정이 없습니다.");
      return;
    }

    const payload = {
      // 요약 필드(분리 저장을 위한 힌트)
      title: plan.title || d.name || d.title || "",
      destinationName: d.name || d.title || "",
      destinationId: d.contentid || d.id || "",
      periodStart: data?.options?.startDate || yyyymmddToISO(f.eventstartdate || d.eventstartdate || ""),
      periodEnd: data?.options?.endDate || yyyymmddToISO(f.eventenddate || d.eventenddate || ""),
      days: data?.options?.days || (Array.isArray(plan?.daily) ? plan.daily.length : undefined),

      // 원본 구조
      origin: data.origin,
      destination: data.destination,
      preferences: data.preferences,
      options: data.options,
      plan: plan,
    };

    try {
      setSaving(true);
      await saveItinerary(payload); // axiosInstance 사용 가정
      alert("일정이 저장되었습니다. 마이페이지에서 확인하세요.");
      onFinish();
    } catch (err) {
      console.error("일정 저장 실패:", err);
      alert("일정 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sr4 sr4-wrap">
      <h2>요약 결과</h2>

      {ai.error && <div className="sr4-card sr4-err-card">{ai.error}</div>}

      {/* 출발지 */}
      <section className="sr4-card">
        <h3>출발지</h3>
        <div className="sr4-kv"><span>이름</span><b>{o.name || "-"}</b></div>
        <div className="sr4-kv"><span>주소</span><b>{o.address || "-"}</b></div>
      </section>

      {/* 도착지(축제) */}
      <section className="sr4-card">
        <h3>도착지(축제)</h3>
        <div className="sr4-row">
          {(f.firstimage || d.firstimage) && (
            <img
              src={f.firstimage || d.firstimage}
              alt=""
              style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 8, background: "#f3f4f6" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700 }}>{d.name ?? d.title ?? "-"}</div>
            <div className="sr4-hint">{d.address ?? d.addr1 ?? "-"}</div>
            <div className="sr4-hint">
              {f.eventstartdate ? yyyymmddToISO(f.eventstartdate) : (d.eventstartdate ? yyyymmddToISO(d.eventstartdate) : "-")}
              {" ~ "}
              {f.eventenddate ? yyyymmddToISO(f.eventenddate) : (d.eventenddate ? yyyymmddToISO(d.eventenddate) : "-")}
            </div>
          </div>
        </div>
      </section>

      {/* 선호 */}
      <section className="sr4-card">
        <h3>선호 스타일</h3>
        <div>{prefText}</div>
      </section>

      {/* 옵션 */}
      <section className="sr4-card">
        <h3>여행 옵션</h3>
        <div className="sr4-grid2">
          <div className="sr4-kv"><span>인원</span><b>{data?.options?.people ?? "-"}</b></div>
          <div className="sr4-kv"><span>여행일수</span><b>{data?.options?.days ?? "-"}</b></div>
          <div className="sr4-kv"><span>기간</span><b>{data?.options?.startDate ?? "-"} ~ {data?.options?.endDate ?? "-"}</b></div>
          <div className="sr4-kv"><span>스타일</span><b>{data?.options?.tempo ?? "-"}</b></div>
          <div className="sr4-kv"><span>일정 간 텀</span><b>{data?.options?.gapMinutes ? `${data.options.gapMinutes}분` : "-"}</b></div>
          <div className="sr4-kv"><span>코스/일</span><b>{data?.options?.stopsPerDay ?? "-"}</b></div>
        </div>
      </section>

      {/* AI 추천 일정 */}
      <section className="sr4-card">
        <h3>AI 추천 일정</h3>
        {!plan ? (
          <div style={{ color: "#b91c1c" }}>일정 없음</div>
        ) : (
          <>
            {plan.title && <div style={{ fontWeight: 700, marginBottom: 6 }}>{plan.title}</div>}
            {plan.summary && <div className="sr4-hint" style={{ marginBottom: 8 }}>{plan.summary}</div>}
            <ul className="sr4-list">
              {daysArr.map((day) => (
                <li key={day.day} className="sr4-item">
                  <div style={{ fontWeight: 600 }}>{`Day ${day.day} · ${day.date || ""}`}</div>
                  <ul style={{ listStyle: "disc", marginLeft: 18, marginTop: 6 }}>
                    {(day.stops || []).slice(0, 8).map((s, idx) => (
                      <li key={idx} style={{ fontSize: 13, color: "#374151" }}>
                        <b>{s.time}</b> {s.name} <span className="sr4-hint">({s.address})</span>
                        {s.notes ? <span className="sr4-hint"> · {s.notes}</span> : null}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* 주변 후보 */}
      <section className="sr4-card">
        <h3>도착지 주변 추천 후보(반경 2km)</h3>
        {nearby.loading && <div className="sr4-hint">불러오는 중…</div>}
        {nearby.error && <div style={{ color: "#b91c1c" }}>{nearby.error}</div>}
        {!nearby.loading && !nearby.error && (
          <ul className="sr4-list">
            {nearby.items.slice(0, 10).map((it) => (
              <li key={it.id} className="sr4-item">
                <div className="sr4-row">
                  <img
                    src={it.imageUrl || ""}
                    alt=""
                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, background: "#f3f4f6" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sr4-name">{it.name}</div>
                    <div className="sr4-addr">{it.address}</div>
                  </div>
                  <div className="sr4-dist">{fmtMeters(it.dist)}</div>
                </div>
              </li>
            ))}
            {!nearby.items.length && <li className="sr4-item"><span className="sr4-hint">결과 없음</span></li>}
          </ul>
        )}
      </section>

      {/* actions */}
      <div className="sr4-actions">
        <button type="button" className="sr4-btn" onClick={onPrev}>이전</button>
        <button
          type="button"
          className="sr4-btn sr4-btn--pri"
          onClick={handleFinish}
          disabled={saving || !plan}
        >
          {saving ? "저장 중..." : "완료"}
        </button>
      </div>
    </div>
  );
}

/* utils */
function yyyymmddToISO(s) {
  if (!s || s.length !== 8) return s || "";
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}
function fmtMeters(m) {
  const v = Number(m || 0);
  if (v >= 1000) return `${(v / 1000).toFixed(1)}km`;
  return `${Math.round(v)}m`;
}
