// tabs: 4
import { useMemo, useState } from "react";

const CATS = [
    { id: 12, label: "관광지" },
    { id: 14, label: "문화시설" },
    { id: 15, label: "축제/공연/행사" },
    { id: 25, label: "여행코스" },
    { id: 28, label: "레포츠" },
    { id: 32, label: "숙박" },
    { id: 38, label: "쇼핑" },
    { id: 39, label: "음식점" },
];

export default function Step2Preferences({ onPrev, onNext, defaultSelected = [15, 12, 39] }) {
    const [selected, setSelected] = useState(defaultSelected);
    const canProceed = useMemo(() => selected.length > 0, [selected]);

    const toggle = (id) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
    };

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
            <h2>2. 선호 여행 스타일</h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: 12 }}>
                {CATS.map((c) => {
                    const active = selected.includes(c.id);
                    return (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => toggle(c.id)}
                            style={{
                                padding: "14px 12px",
                                borderRadius: 12,
                                border: "1px solid #d1d5db",
                                background: active ? "#eef2ff" : "#fff",
                                boxShadow: active ? "inset 0 0 0 2px #2563eb" : "none",
                                textAlign: "left",
                                cursor: "pointer",
                            }}
                        >
                            <div style={{ fontSize: 16, fontWeight: 700 }}>{c.label}</div>
                            <div style={{ fontSize: 12, opacity: 0.8 }}>#{c.id}</div>
                        </button>
                    );
                })}
            </div>

            <div style={{ marginTop: 12, fontSize: 14, color: "#374151" }}>
                선택: {selected.sort((a, b) => a - b).join(", ")}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                <button type="button" onClick={onPrev}>이전</button>
                <button type="button" onClick={() => onNext?.({ contentTypeIds: selected })} disabled={!canProceed}>
                    다음
                </button>
            </div>
        </div>
    );
}
