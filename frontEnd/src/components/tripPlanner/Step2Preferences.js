import { useMemo, useState } from "react";
import "./Step2Preferences.css";

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
    <div className="sp2 sp2-wrap">
      <h2>2. 선호 여행 스타일</h2>

      <div className="sp2-grid" role="group" aria-label="선호 카테고리">
        {CATS.map((c) => {
          const active = selected.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              className={`sp2-opt ${active ? "is-active" : ""}`}
              aria-pressed={active}
            >
              <div className="sp2-title">{c.label}</div>
              <div className="sp2-sub">#{c.id}</div>
            </button>
          );
        })}
      </div>

      <div className="sp2-selected">
        선택: {selected.slice().sort((a, b) => a - b).join(", ")}
      </div>

      <div className="sp2-actions">
        <button type="button" className="sp2-btn" onClick={onPrev}>이전</button>
        <button
          type="button"
          className="sp2-btn sp2-btn--pri"
          onClick={() => onNext?.({ contentTypeIds: selected })}
          disabled={!canProceed}
        >
          다음
        </button>
      </div>
    </div>
  );
}
