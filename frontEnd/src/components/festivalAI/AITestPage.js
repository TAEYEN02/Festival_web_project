import { useState } from "react";
import { buildTravelPayload, recommendTravel, getTravelSampleQuery } from "../../api/travel";

export default function AITestPage() {
    const [form, setForm] = useState({
        origin: "Seoul, KR",
        days: 5,
        budget: 120,
        companions: "couple",
        styles: ["food", "culture", "relax"],
        months: [9, 10],
        climate: "mild",
        mustHave: ["beach", "local food"],
        avoid: ["extreme sports"],
        language: "ko",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const [showRaw, setShowRaw] = useState(false);

    const stylesChipWrap = { display: "flex", flexWrap: "wrap", gap: 8 };
    const chip = { padding: "6px 10px", borderRadius: 999, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 12 };
    const lbl = { fontSize: 13, fontWeight: 600, marginBottom: 6, display: "block" };
    const input = { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10, outline: "none" };
    const btn = { padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#f7f7f7", cursor: "pointer" };
    const btnDark = { ...btn, background: "#111827", color: "#fff", borderColor: "#111827" };
    const btnDanger = { ...btn, background: "#ef4444", color: "#fff", borderColor: "#ef4444" };
    const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
    const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 };

    function set(k, v) {
        setForm((prev) => ({ ...prev, [k]: v }));
    }

    function parseCSV(str) {
        if (Array.isArray(str)) return str;
        if (!str) return [];
        return String(str).split(",").map((s) => s.trim()).filter(Boolean);
    }

    function parseNumsCSV(str) {
        const arr = parseCSV(str);
        return arr.map((v) => Number(v)).filter((n) => Number.isFinite(n) && n >= 1 && n <= 12);
    }

    async function fillSample() {
        setError("");
        try {
            const sample = await getTravelSampleQuery();
            setForm({
                origin: sample.origin ?? "",
                days: sample.duration_days ?? "",
                budget: sample.budget_per_day_usd ?? "",
                companions: sample.companions ?? "",
                styles: sample.travel_styles ?? [],
                months: sample.months ?? [],
                climate: sample.climate ?? "",
                mustHave: sample.must_have ?? [],
                avoid: sample.avoid ?? [],
                language: sample.language ?? "ko",
            });
        } catch (e) {
            setError(e?.message || "샘플 불러오기 실패");
        }
    }

    async function onSubmit(e) {
        e?.preventDefault?.();
        setError("");
        setResult(null);
        setLoading(true);
        try {
            const payload = buildTravelPayload({
                origin: form.origin,
                days: form.days,
                budget: form.budget,
                companions: form.companions,
                styles: form.styles,
                months: form.months,
                climate: form.climate,
                mustHave: form.mustHave,
                avoid: form.avoid,
                language: form.language,
            });
            const data = await recommendTravel(payload);
            console.log("data ::", data);
            setResult(data);
        } catch (e) {
            setError(e?.message || "요청 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    }

    function resetForm() {
        setForm({
            origin: "",
            days: "",
            budget: "",
            companions: "",
            styles: [],
            months: [],
            climate: "",
            mustHave: [],
            avoid: [],
            language: "ko",
        });
        setResult(null);
        setError("");
    }

    return (
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: 20 }}>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>🤖 AI 여행 추천 — 테스트 페이지</h2>
            <p style={{ color: "#6b7280", marginBottom: 16 }}>
                폼을 채우고 <b>추천 받기</b>를 누르면 Python API가 Vertex AI를 호출해 JSON 결과를 내려줍니다.
            </p>

            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={grid3}>
                    <div>
                        <label style={lbl}>출발지 (origin)</label>
                        <input
                            style={input}
                            type="text"
                            placeholder="Seoul, KR"
                            value={form.origin}
                            onChange={(e) => set("origin", e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={lbl}>기간(일)</label>
                        <input
                            style={input}
                            type="number"
                            min={1}
                            max={60}
                            value={form.days}
                            onChange={(e) => set("days", e.target.value)}
                        />
                    </div>
                    <div>
                        <label style={lbl}>일일 예산(USD)</label>
                        <input
                            style={input}
                            type="number"
                            min={10}
                            max={2000}
                            value={form.budget}
                            onChange={(e) => set("budget", e.target.value)}
                        />
                    </div>
                </div>

                <div style={grid3}>
                    <div>
                        <label style={lbl}>동행 (companions)</label>
                        <select
                            style={input}
                            value={form.companions}
                            onChange={(e) => set("companions", e.target.value)}
                        >
                            <option value="">(선택)</option>
                            <option value="solo">solo</option>
                            <option value="couple">couple</option>
                            <option value="family">family</option>
                            <option value="friends">friends</option>
                            <option value="group">group</option>
                        </select>
                    </div>
                    <div>
                        <label style={lbl}>스타일 (콤마 구분)</label>
                        <input
                            style={input}
                            type="text"
                            placeholder="food,culture,relax"
                            value={Array.isArray(form.styles) ? form.styles.join(",") : form.styles}
                            onChange={(e) => set("styles", parseCSV(e.target.value))}
                        />
                        {Array.isArray(form.styles) && form.styles.length > 0 && (
                            <div style={{ marginTop: 6, ...stylesChipWrap }}>
                                {form.styles.map((s) => (
                                    <span key={s} style={chip}>#{s}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label style={lbl}>예정 월 (1~12, 콤마)</label>
                        <input
                            style={input}
                            type="text"
                            placeholder="9,10"
                            value={Array.isArray(form.months) ? form.months.join(",") : form.months}
                            onChange={(e) => set("months", parseNumsCSV(e.target.value))}
                        />
                        {Array.isArray(form.months) && form.months.length > 0 && (
                            <div style={{ marginTop: 6, ...stylesChipWrap }}>
                                {form.months.map((m) => (
                                    <span key={m} style={chip}>{m}월</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={grid2}>
                    <div>
                        <label style={lbl}>선호 기후</label>
                        <select
                            style={input}
                            value={form.climate}
                            onChange={(e) => set("climate", e.target.value)}
                        >
                            <option value="">(선택)</option>
                            <option value="warm">warm</option>
                            <option value="mild">mild</option>
                            <option value="cold">cold</option>
                            <option value="dry">dry</option>
                            <option value="humid">humid</option>
                            <option value="doesn't matter">doesn't matter</option>
                        </select>
                    </div>
                    <div>
                        <label style={lbl}>언어</label>
                        <select
                            style={input}
                            value={form.language}
                            onChange={(e) => set("language", e.target.value)}
                        >
                            <option value="ko">ko</option>
                            <option value="en">en</option>
                            <option value="ja">ja</option>
                        </select>
                    </div>
                </div>

                <div style={grid2}>
                    <div>
                        <label style={lbl}>반드시 포함 (콤마)</label>
                        <input
                            style={input}
                            type="text"
                            placeholder="beach,local food"
                            value={Array.isArray(form.mustHave) ? form.mustHave.join(",") : form.mustHave}
                            onChange={(e) => set("mustHave", parseCSV(e.target.value))}
                        />
                        {Array.isArray(form.mustHave) && form.mustHave.length > 0 && (
                            <div style={{ marginTop: 6, ...stylesChipWrap }}>
                                {form.mustHave.map((s) => (
                                    <span key={s} style={chip}>+ {s}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label style={lbl}>피하고 싶은 것 (콤마)</label>
                        <input
                            style={input}
                            type="text"
                            placeholder="extreme sports"
                            value={Array.isArray(form.avoid) ? form.avoid.join(",") : form.avoid}
                            onChange={(e) => set("avoid", parseCSV(e.target.value))}
                        />
                        {Array.isArray(form.avoid) && form.avoid.length > 0 && (
                            <div style={{ marginTop: 6, ...stylesChipWrap }}>
                                {form.avoid.map((s) => (
                                    <span key={s} style={chip}>- {s}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                    <button type="submit" style={btnDark} disabled={loading}>
                        {loading ? "추천 중..." : "추천 받기"}
                    </button>
                    <button type="button" style={btn} onClick={fillSample} disabled={loading}>
                        샘플 불러오기
                    </button>
                    <button type="button" style={btn} onClick={() => setShowRaw((v) => !v)}>
                        {showRaw ? "JSON 숨기기" : "JSON 보기"}
                    </button>
                    <button type="button" style={btnDanger} onClick={resetForm} disabled={loading}>
                        초기화
                    </button>
                </div>
            </form>

            {error && (
                <div style={{ marginTop: 14, padding: 12, borderRadius: 10, border: "1px solid #fecaca", background: "#fee2e2", color: "#991b1b" }}>
                    오류: {error}
                </div>
            )}

            {result && (
                <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                    <section style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff" }}>
                        <h3 style={{ fontSize: 20, marginBottom: 8 }}>Top Pick</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <b style={{ fontSize: 18 }}>
                                {result.top_pick?.name}
                                {result.top_pick?.country ? ` • ${result.top_pick.country}` : ""}
                            </b>
                            <div style={{ color: "#6b7280" }}>{result.top_pick?.summary}</div>
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                {result.top_pick?.best_time && (
                                    <span style={chip}>🗓 {result.top_pick.best_time}</span>
                                )}
                                {typeof result.top_pick?.est_budget_per_day_usd === "number" && (
                                    <span style={chip}>💰 ${result.top_pick.est_budget_per_day_usd}/day</span>
                                )}
                            </div>
                            {Array.isArray(result.top_pick?.highlights) && result.top_pick.highlights.length > 0 && (
                                <div style={{ marginTop: 6 }}>
                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>하이라이트</div>
                                    <div style={stylesChipWrap}>
                                        {result.top_pick.highlights.map((h) => (
                                            <span key={h} style={chip}>★ {h}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {Array.isArray(result.top_pick?.tags) && result.top_pick.tags.length > 0 && (
                                <div style={{ marginTop: 6 }}>
                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>태그</div>
                                    <div style={stylesChipWrap}>
                                        {result.top_pick.tags.map((t) => (
                                            <span key={t} style={chip}>#{t}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {Array.isArray(result.alternatives) && result.alternatives.length > 0 && (
                        <section style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff" }}>
                            <h3 style={{ fontSize: 18, marginBottom: 8 }}>대안 (Alternatives)</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                {result.alternatives.map((d) => (
                                    <div key={d.name} style={{ padding: 10, border: "1px solid #eee", borderRadius: 10 }}>
                                        <b>{d.name}{d.country ? ` • ${d.country}` : ""}</b>
                                        <div style={{ color: "#6b7280", marginTop: 4 }}>{d.summary}</div>
                                        <div style={{ marginTop: 6, ...stylesChipWrap }}>
                                            {(d.highlights || []).slice(0, 3).map((h) => (
                                                <span key={h} style={chip}>★ {h}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {Array.isArray(result.itinerary) && result.itinerary.length > 0 && (
                        <section style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff" }}>
                            <h3 style={{ fontSize: 18, marginBottom: 8 }}>샘플 일정 (Itinerary)</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                                {result.itinerary.map((it) => (
                                    <div key={it.day} style={{ padding: 10, border: "1px solid #eee", borderRadius: 10 }}>
                                        <b>Day {it.day} — {it.title}</b>
                                        <ul style={{ margin: "6px 0 0 18px" }}>
                                            {(it.activities || []).map((a, idx) => (
                                                <li key={idx}>{a}</li>
                                            ))}
                                        </ul>
                                        {it.notes && <div style={{ marginTop: 6, color: "#6b7280" }}>📝 {it.notes}</div>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff" }}>
                        <h3 style={{ fontSize: 18, marginBottom: 8 }}>추천 이유</h3>
                        <div style={{ whiteSpace: "pre-wrap" }}>{result.rationale}</div>
                    </section>

                    {showRaw && (
                        <section style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff" }}>
                            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Raw JSON</h3>
                            <pre style={{ margin: 0, overflowX: "auto" }}>
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
