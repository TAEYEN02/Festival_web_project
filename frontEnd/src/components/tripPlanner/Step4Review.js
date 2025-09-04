import { useEffect, useMemo, useState } from "react";
import { createItinerary } from "./api/aiClient";
import "./Step4Review.css";

/**
 * props:
 *  - data = { origin, destination, preferences, options }
 *  - onPrev: () => void
 *  - onFinish: () => void
 */
export default function Step4Review({ data, onPrev, onFinish }) {
  const [ai, setAi] = useState({ loading: true, error: "", plan: null });
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
    const dest = data?.destination || {};
    const lat = Number(dest.mapy);
    const lng = Number(dest.mapx);
    const contentTypes = (data?.preferences?.contentTypeIds || [15, 12, 39]).map(String);
    const serviceKey = process.env.REACT_APP_TOURAPI_KEY;

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
      const resp = await fetch(url);
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
        setNearby({ loading: false, error: "주변 후보 조회 실패", items: [] });
      }
    })();
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
  const opt = data?.options || {};
  const plan = ai.plan;

  return (
    <div className="sr4 sr4-wrap">
      <h2>요약 결과</h2>

      {ai.error && <div className="sr4-card sr4-err-card">{ai.error}</div>}

      {/* 출발지 */}
      <section className="sr4-card">
        <h3>출발지</h3>
        <div className="sr4-kv"><span>이름</span><b>{o.name || "-"}</b></div>
        <div className="sr4-kv"><span>주소</span><b>{o.address || "-"}</b></div>
        <div className="sr4-kv"><span>좌표</span><b>{fmtCoord(o.lat, o.lng)}</b></div>
      </section>

      {/* 도착지 */}
      <section className="sr4-card">
        <h3>도착지(축제)</h3>
        <div className="sr4-row">
          {d.firstimage && (
            <img
              src={d.firstimage}
              alt=""
              style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 8, background: "#f3f4f6" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700 }}>{d.title || "-"}</div>
            <div className="sr4-hint">{d.addr1 || "-"}</div>
            <div className="sr4-hint">
              {d.eventstartdate ? yyyymmddToISO(d.eventstartdate) : "-"} ~ {d.eventenddate ? yyyymmddToISO(d.eventenddate) : "-"}
            </div>
            <div className="sr4-hint">좌표: {fmtCoord(d.mapy, d.mapx)}</div>
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
          <div className="sr4-kv"><span>인원</span><b>{opt.people || "-"}</b></div>
          <div className="sr4-kv"><span>여행일수</span><b>{opt.days || "-"}</b></div>
          <div className="sr4-kv"><span>기간</span><b>{opt.startDate || "-"} ~ {opt.endDate || "-"}</b></div>
          <div className="sr4-kv"><span>스타일</span><b>{opt.tempo || "-"}</b></div>
          <div className="sr4-kv"><span>일정 간 텀</span><b>{opt.gapMinutes ? `${opt.gapMinutes}분` : "-"}</b></div>
          <div className="sr4-kv"><span>코스/일</span><b>{opt.stopsPerDay || "-"}</b></div>
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
              {(plan.daily || []).map((day) => (
                <li key={day.day} className="sr4-item">
                  <div style={{ fontWeight: 600 }}>{`Day ${day.day} · ${day.date || ""}`}</div>
                  <ul style={{ listStyle:"disc", marginLeft:18, marginTop:6 }}>
                    {(day.stops || []).slice(0, 8).map((s, idx) => (
                      <li key={idx} style={{ fontSize:13, color:"#374151" }}>
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
        {nearby.error && <div style={{ color:"#b91c1c" }}>{nearby.error}</div>}
        {!nearby.loading && !nearby.error && (
          <ul className="sr4-list">
            {nearby.items.slice(0, 10).map((it) => (
              <li key={it.id} className="sr4-item">
                <div className="sr4-row">
                  <img
                    src={it.imageUrl || ""}
                    alt=""
                    style={{ width:60, height:60, objectFit:"cover", borderRadius:8, background:"#f3f4f6" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <div style={{ flex:1, minWidth:0 }}>
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
        <button type="button" className="sr4-btn sr4-btn--pri" onClick={onFinish}>완료</button>
      </div>
    </div>
  );
}

/* utils */
function fmtCoord(lat, lng) {
  const a = Number(lat), b = Number(lng);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return "-";
  return `${a.toFixed(6)}, ${b.toFixed(6)}`;
}
function yyyymmddToISO(s) {
  if (!s || s.length !== 8) return s || "";
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}
function fmtMeters(m) {
  const v = Number(m || 0);
  if (v >= 1000) return `${(v / 1000).toFixed(1)}km`;
  return `${Math.round(v)}m`;
}
