import { useEffect, useMemo, useState } from "react";
import { fetchFestivalsPage } from "../../api/regionFestival"; // 경로 맞춰서 import

export default function FestivalPickerModal({ open, onClose, onPick }) {
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [page, setPage] = useState(1);          // UI는 1-base
    const [rows, setRows] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);

    const status = "all";                          // 기본: 진행중+예정
    const month = "all";
    const sort = "endSoon";
    const region = "all";
    const includePast = false;

    const fetchList = async () => {
        if (!start || !end) return;
        setLoading(true);
        setError("");
        try {
            // regionFestival의 page는 0-base, size는 rows
            const res = await fetchFestivalsPage({
                query: "",
                region,
                sort,
                status,
                month,
                page: Math.max(0, page - 1),
                size: rows,
                includePast,
                signal: undefined,
            });
            console.log("res :::", res);
            setItems(res.items);
            setTotal(res.total);
        } catch (e) {
            setItems([]);
            setTotal(0);
            setError("축제 목록 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!open) return;
        if (!start || !end) {
            const today = new Date();
            const plus = new Date(today.getTime() + 1000 * 60 * 60 * 24 * 60);
            const toISO = (d) => d.toISOString().slice(0, 10);
            setStart((s) => s || toISO(today));
            setEnd((e) => e || toISO(plus));
        }
        setPage(1);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, page, rows, start, end]);

    const close = () => {
        onClose?.();
    };

    if (!open) return null;

    return (
        <div style={backdropStyle} onClick={close}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={headerStyle}>
                    <h3 style={{ margin: 0 }}>축제 선택</h3>
                    <button type="button" onClick={close}>닫기</button>
                </div>

                {/* 검색 영역 */}
                <div style={controlsStyle}>
                    <div style={rowStyle}>
                        <label style={labelStyle}>기간</label>
                        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={inputStyle} />
                        <span>~</span>
                        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={inputStyle} />
                        <button type="button" onClick={() => { setPage(1); fetchList(); }} disabled={loading}>조회</button>
                    </div>
                    <div style={rowStyle}>
                        <label style={labelStyle}>표시개수</label>
                        <select value={rows} onChange={(e) => { setRows(Number(e.target.value)); setPage(1); }}>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={30}>30</option>
                        </select>
                    </div>
                </div>

                {/* 목록 */}
                {error && <div style={{ color: "#b91c1c", marginBottom: 8 }}>{error}</div>}
                {loading ? (
                    <div>불러오는 중…</div>
                ) : (
                    <ul style={listStyle}>
                        {items.map((it) => (
                            <li key={it.id} style={itemStyle}>
                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <img
                                        src={it.imageUrl || ""}
                                        alt=""
                                        style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, background: "#f3f4f6" }}
                                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {it.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {it.address || ""}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                                            {it.startDate} ~ {it.endDate}
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onPick?.({
                                                    // Step1에서 기대하는 도착지 형태로 매핑
                                                    title: it.name,
                                                    addr1: it.address || "",
                                                    // TourAPI 표준 좌표 키로도 제공
                                                    mapx: it.lng,
                                                    mapy: it.lat,
                                                    contentid: it.id,
                                                    eventstartdate: it.startDate?.replaceAll("-", ""),
                                                    eventenddate: it.endDate?.replaceAll("-", ""),
                                                    firstimage: it.imageUrl || "",
                                                })
                                            }
                                        >
                                            선택
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {!items.length && <li style={{ padding: 12, color: "#6b7280" }}>결과 없음</li>}
                    </ul>
                )}

                {/* 페이지네이션 */}
                <div style={pagerStyle}>
                    <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>
                        이전
                    </button>
                    <span>{page}</span>
                    <button
                        type="button"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={loading || items.length < rows || rows * page >= total}
                    >
                        다음
                    </button>
                    <span style={{ marginLeft: 8, color: "#6b7280" }}>총 {total}건</span>
                </div>
            </div>
        </div>
    );
}

const backdropStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 1000,
};

const modalStyle = {
    width: "min(900px, 100%)",
    maxHeight: "90vh",
    overflow: "auto",
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
};

const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
};

const controlsStyle = {
    display: "grid",
    gap: 8,
    marginBottom: 8,
};

const rowStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
};

const labelStyle = {
    width: 80,
    fontSize: 14,
    color: "#374151",
};

const inputStyle = {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
};

const listStyle = {
    listStyle: "none",
    margin: 0,
    padding: 0,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
};

const itemStyle = {
    padding: 12,
    borderBottom: "1px solid #f1f5f9",
};

const pagerStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: 10,
};
