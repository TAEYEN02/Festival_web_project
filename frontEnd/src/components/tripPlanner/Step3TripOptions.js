import { useEffect, useMemo, useState } from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { Korean } from "flatpickr/dist/l10n/ko.js";
import "./Step3TripOptions.css";

/* YYYY-MM-DD 로컬 포맷 */
const fmt = (d) => (d instanceof Date ? d.toLocaleDateString("sv-SE") : "");
const parseYMD = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0); // 로컬 자정
};

export default function Step3TripOptions({
  onPrev,
  onNext,
  defaultStartDate = "",
  defaultEndDate = "",
}) {
  const today = fmt(new Date());

  const [people, setPeople] = useState(2);
  const [startDate, setStartDate] = useState(defaultStartDate || today);
  const [endDate, setEndDate] = useState(
    defaultEndDate || fmt(new Date(new Date().setDate(new Date().getDate() + 1)))
  );
  const [tempo, setTempo] = useState("relaxed"); // relaxed | dense | custom
  const [gapMinutes, setGapMinutes] = useState(90);
  const [stopsPerDay, setStopsPerDay] = useState(3);

  // 템포 프리셋
  useEffect(() => {
    if (tempo === "relaxed") { setGapMinutes(90); setStopsPerDay(3); }
    else if (tempo === "dense") { setGapMinutes(60); setStopsPerDay(6); }
  }, [tempo]);

  // 여행일수(로컬 자정 기준)
  const days = useMemo(() => {
    const s = parseYMD(startDate), e = parseYMD(endDate);
    if (!s || !e) return 0;
    s.setHours(0,0,0,0); e.setHours(0,0,0,0);
    const diff = Math.round((e - s) / 86400000) + 1;
    return diff > 0 ? diff : 0;
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

      {/* 기간: 한 입력으로 범위 선택 */}
      <section className="sp3-card">
        <h3>기간</h3>
        <div className="sp3-row" style={{ width: "100%" }}>
          <Flatpickr
            options={{
              mode: "range",
              dateFormat: "Y-m-d",
              locale: Korean,
              minDate: "today",
              allowInput: true,
              conjunction: " ~ ",
            }}
            value={[parseYMD(startDate), parseYMD(endDate)].filter(Boolean)}
            onChange={(dates) => {
              // 사용자가 누른 순서 그대로 start/end 저장. 타임존 불일치 방지 위해 fmt 사용.
              if (dates.length === 1) {
                setStartDate(fmt(dates[0]));
                setEndDate("");
              } else if (dates.length === 2) {
                const [s, e] = dates;
                setStartDate(fmt(s));
                setEndDate(fmt(e));
              }
            }}
            className="sp3-input"
            style={{ width: "100%" }}
            placeholder="기간을 선택하세요"
          />
        </div>
        {!dateValid && <div className="sp3-err">시작일이 종료일보다 늦습니다.</div>}
        {dateValid && <div className="sp3-hint">여행일수: {days}일</div>}
      </section>

      {/* 여행 스타일 */}
      <section className="sp3-card">
        <h3>여행 스타일</h3>
        <div className="sp3-row" style={{ gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setTempo("relaxed")}
            className={`sp3-btn ${tempo==="relaxed" ? "sp3-btn--active" : ""}`}>
            널널하게 (3코스/일)
          </button>
          <button type="button" onClick={() => setTempo("dense")}
            className={`sp3-btn ${tempo==="dense" ? "sp3-btn--active" : ""}`}>
            빼곡하게 (6코스/일)
          </button>
          <button type="button" onClick={() => setTempo("custom")}
            className={`sp3-btn ${tempo==="custom" ? "sp3-btn--active" : ""}`}>
            직접 설정
          </button>
        </div>

        {tempo === "custom" && (
          <>
            <div className="sp3-row" style={{ marginTop: 16 }}>
              <label className="sp3-label">일정 간 텀</label>
              <div className="sp3-row" style={{ gap: 8, flexWrap: "wrap" }}>
                {[45, 60, 90, 120, 150].map((m) => (
                  <button key={m} type="button" onClick={() => setGapMinutes(m)}
                    className={`sp3-chip ${gapMinutes===m ? "sp3-chip--active" : ""}`}>
                    {m}분
                  </button>
                ))}
                <input
                  type="number" min={30} max={240} step={5} value={gapMinutes}
                  onChange={(e) => setGapMinutes(parseInt(e.target.value || "0", 10))}
                  className="sp3-input" style={{ width: 100 }} aria-label="gap-minutes"
                />
              </div>
            </div>

            <div className="sp3-row" style={{ marginTop: 16 }}>
              <label className="sp3-label">코스/일</label>
              <div className="sp3-row" style={{ gap: 8, alignItems: "center" }}>
                <input
                  type="number" min={1} max={12} value={stopsPerDay}
                  onChange={(e) => setStopsPerDay(parseInt(e.target.value || "0", 10))}
                  className="sp3-input" style={{ width: 100 }} aria-label="stops-per-day"
                />
                <span style={{ color: "#6b7280", fontSize: 13 }}>(1~12)</span>
              </div>
            </div>
          </>
        )}
      </section>

      {/* actions */}
      <div className="sp3-actions">
        <button type="button" className="sp3-cta" onClick={onPrev}>이전</button>
        <button type="button" className="sp3-cta sp3-cta--pri" onClick={submit} disabled={!canProceed}>다음</button>
      </div>
    </div>
  );
}
