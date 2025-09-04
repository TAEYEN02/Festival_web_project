import { useEffect, useMemo, useState } from "react";
import "./Step3TripOptions.css";

/**
 * onNext({ people, startDate, endDate, days, tempo, gapMinutes, stopsPerDay })
 */
export default function Step3TripOptions({
  onPrev,
  onNext,
  defaultStartDate = "",
  defaultEndDate = "",
}) {
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const plusDaysISO = (n) => {
    const d = new Date(); d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  const [people, setPeople] = useState(2);
  const [startDate, setStartDate] = useState(defaultStartDate || todayISO());
  const [endDate, setEndDate] = useState(defaultEndDate || plusDaysISO(1));
  const [tempo, setTempo] = useState("relaxed"); // relaxed | dense | custom
  const [gapMinutes, setGapMinutes] = useState(90);
  const [stopsPerDay, setStopsPerDay] = useState(3);

  useEffect(() => {
    if (tempo === "relaxed") { setGapMinutes(90); setStopsPerDay(3); }
    else if (tempo === "dense") { setGapMinutes(60); setStopsPerDay(6); }
  }, [tempo]);

  const days = useMemo(() => {
    const s = new Date(startDate), e = new Date(endDate);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
    return Number.isFinite(diff) && diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const dateValid = days > 0;
  const canProceed =
    Number.isInteger(people) && people >= 1 && people <= 99 &&
    dateValid && gapMinutes >= 30 && gapMinutes <= 240 &&
    stopsPerDay >= 1 && stopsPerDay <= 12;

  const submit = () => {
    if (!canProceed) return;
    onNext?.({ people, startDate, endDate, days, tempo, gapMinutes, stopsPerDay });
  };

  return (
    <div className="sp3 sp3-wrap">
      <h2>3. 인원수 · 기간 · 스타일</h2>

      {/* 인원수 */}
      <section className="sp3-card">
        <h3>인원수</h3>
        <div className="sp3-row">
          <input
            type="number" min={1} max={99}
            value={people}
            onChange={(e) => setPeople(Math.max(1, Math.min(99, parseInt(e.target.value || "0", 10))))}
            className="sp3-input" aria-label="people"
          />
          <span>명</span>
        </div>
      </section>

      {/* 기간 */}
      <section className="sp3-card">
        <h3>기간</h3>
        <div className="sp3-row">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="sp3-input" />
          <span>~</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="sp3-input" />
        </div>
        {!dateValid && <div className="sp3-err">시작일이 종료일보다 늦습니다.</div>}
        {dateValid && <div className="sp3-hint">여행일수: {days}일</div>}
      </section>

      {/* 여행 스타일 */}
      <section className="sp3-card">
        <h3>여행 스타일</h3>
        <div className="sp3-row">
          <button type="button" onClick={() => setTempo("relaxed")}
            className={`sp3-btn ${tempo==="relaxed" ? "sp3-btn--active" : ""}`}>
            널널하게(3코스/일)
          </button>
          <button type="button" onClick={() => setTempo("dense")}
            className={`sp3-btn ${tempo==="dense" ? "sp3-btn--active" : ""}`}>
            빼곡하게(6코스/일)
          </button>
          <button type="button" onClick={() => setTempo("custom")}
            className={`sp3-btn ${tempo==="custom" ? "sp3-btn--active" : ""}`}>
            직접 설정
          </button>
        </div>

        <div className="sp3-row" style={{ marginTop: 10 }}>
          <label className="sp3-label">일정 간 텀</label>
          <div className="sp3-row" style={{ gap: 8, flexWrap: "wrap" }}>
            {[30, 45, 60, 90, 120, 150, 180].map((m) => (
              <button key={m} type="button" onClick={() => { setTempo("custom"); setGapMinutes(m); }}
                className={`sp3-chip ${gapMinutes===m ? "sp3-chip--active" : ""}`}>
                {m}분
              </button>
            ))}
            <input
              type="number" min={30} max={240} step={5} value={gapMinutes}
              onChange={(e) => { setTempo("custom"); setGapMinutes(parseInt(e.target.value || "0", 10)); }}
              className="sp3-input" style={{ width: 100 }} aria-label="gap-minutes"
            />
          </div>
        </div>

        <div className="sp3-row" style={{ marginTop: 10 }}>
          <label className="sp3-label">코스/일</label>
          <div className="sp3-row" style={{ gap: 8, alignItems: "center" }}>
            <input
              type="number" min={1} max={12} value={stopsPerDay}
              onChange={(e) => { setTempo("custom"); setStopsPerDay(parseInt(e.target.value || "0", 10)); }}
              className="sp3-input" style={{ width: 100 }} aria-label="stops-per-day"
            />
            <span style={{ color: "#6b7280", fontSize: 13 }}>(1~12)</span>
          </div>
        </div>
      </section>

      {/* actions */}
      <div className="sp3-actions">
        <button type="button" className="sp3-cta" onClick={onPrev}>이전</button>
        <button type="button" className="sp3-cta sp3-cta--pri" onClick={submit} disabled={!canProceed}>다음</button>
      </div>
    </div>
  );
}
