// tabs: 4
import { useEffect, useMemo, useState } from "react";

/**
 * 3번 페이지: 인원수, 기간, 여행 스타일(텀/밀도)
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
        const d = new Date();
        d.setDate(d.getDate() + n);
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
        const s = new Date(startDate);
        const e = new Date(endDate);
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
        <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
            <h2>3. 인원수 · 기간 · 스타일</h2>

            <section style={cardStyle}>
                <h3>인원수</h3>
                <div style={rowStyle}>
                    <input
                        type="number"
                        min={1}
                        max={99}
                        value={people}
                        onChange={(e) => setPeople(Math.max(1, Math.min(99, parseInt(e.target.value || "0", 10))))}
                        style={inputStyle}
                    />
                    <span>명</span>
                </div>
            </section>

            <section style={cardStyle}>
                <h3>기간</h3>
                <div style={rowStyle}>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
                    <span>~</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
                </div>
                {!dateValid && <div style={errStyle}>시작일이 종료일보다 늦습니다.</div>}
                {dateValid && <div style={hintStyle}>여행일수: {days}일</div>}
            </section>

            <section style={cardStyle}>
                <h3>여행 스타일</h3>
                <div style={rowStyle}>
                    <button type="button" onClick={() => setTempo("relaxed")} style={{ ...btnStyle, ...(tempo === "relaxed" ? btnActive : {}) }}>
                        널널하게(3코스/일)
                    </button>
                    <button type="button" onClick={() => setTempo("dense")} style={{ ...btnStyle, ...(tempo === "dense" ? btnActive : {}) }}>
                        빼곡하게(6코스/일)
                    </button>
                    <button type="button" onClick={() => setTempo("custom")} style={{ ...btnStyle, ...(tempo === "custom" ? btnActive : {}) }}>
                        직접 설정
                    </button>
                </div>

                <div style={{ ...rowStyle, marginTop: 10 }}>
                    <label style={labelStyle}>일정 간 텀</label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[30, 45, 60, 90, 120, 150, 180].map((m) => (
                            <button key={m} type="button" onClick={() => { setTempo("custom"); setGapMinutes(m); }}
                                style={{ ...chipStyle, ...(gapMinutes === m ? chipActive : {}) }}>
                                {m}분
                            </button>
                        ))}
                        <input
                            type="number" min={30} max={240} step={5} value={gapMinutes}
                            onChange={(e) => { setTempo("custom"); setGapMinutes(parseInt(e.target.value || "0", 10)); }}
                            style={{ ...inputStyle, width: 100 }} aria-label="gap-minutes"
                        />
                    </div>
                </div>

                <div style={{ ...rowStyle, marginTop: 10 }}>
                    <label style={labelStyle}>코스/일</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                            type="number" min={1} max={12} value={stopsPerDay}
                            onChange={(e) => { setTempo("custom"); setStopsPerDay(parseInt(e.target.value || "0", 10)); }}
                            style={{ ...inputStyle, width: 100 }} aria-label="stops-per-day"
                        />
                        <span style={{ color: "#6b7280", fontSize: 13 }}>(1~12)</span>
                    </div>
                </div>
            </section>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                <button type="button" onClick={onPrev}>이전</button>
                <button type="button" onClick={submit} disabled={!canProceed}>다음</button>
            </div>
        </div>
    );
}

const cardStyle = { border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 16, background: "#fff" };
const rowStyle = { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" };
const inputStyle = { padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db" };
const labelStyle = { width: 110, fontSize: 14, color: "#374151" };
const errStyle = { color: "#b91c1c", fontSize: 13, marginTop: 6 };
const hintStyle = { color: "#374151", fontSize: 13, marginTop: 6 };
const btnStyle = { padding: "8px 12px", borderRadius: 10, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" };
const btnActive = { borderColor: "#2563eb", boxShadow: "inset 0 0 0 2px #2563eb", background: "#eef2ff" };
const chipStyle = { padding: "6px 10px", borderRadius: 999, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: 13 };
const chipActive = { borderColor: "#2563eb", boxShadow: "inset 0 0 0 2px #2563eb", background: "#eef2ff" };
