import { REGIONS } from "../../api/festivals";

export default function RegionFilter({ value = "all", onChange }) {
    return (
        <div className="region-filter">
            <button
                className={`region-pill ${value === "all" ? "active" : ""}`}
                onClick={() => onChange("all")}
            >
                전체
            </button>
            {REGIONS.map(r => (
                <button
                    key={r.key}
                    className={`region-pill ${value === r.key ? "active" : ""}`}
                    onClick={() => onChange(r.key)}
                >
                    {r.label}
                </button>
            ))}
        </div>
    );
}
