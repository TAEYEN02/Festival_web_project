import { useEffect, useState } from "react";
import { fetchFestivalsPage } from "../../api/regionFestival";
import "./FestivalPickerModal.css";

export default function FestivalPickerModal({ open, onClose, onPick }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [page, setPage] = useState(1);      // 1-base
  const [rows, setRows] = useState(10);
  const [query, setQuery] = useState("");   // 검색어 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const status = "all";
  const month = "all";
  const sort = "endSoon";
  const region = "all";
  const includePast = false;

  const fetchList = async () => {
    if (!start || !end) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetchFestivalsPage({
        query,
        region,
        sort,
        status,
        month,
        page: Math.max(0, page - 1), // 0-base
        size: rows,
        includePast,
        signal: undefined,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch {
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

  if (!open) return null;

  const close = () => onClose?.();

  return (
    <div className="fpm fpm__backdrop" onClick={close}>
      <div className="fpm__modal" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="fpm__header">
          <h3 className="fpm__title">축제 선택</h3>
          <button type="button" className="fpm__btn" onClick={close}>닫기</button>
        </div>

        {/* controls */}
        <div className="fpm__controls">
          <div className="fpm__row">
            <label className="fpm__label">기간</label>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="fpm__input" />
            <span className="fpm__sep">~</span>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="fpm__input" />
            <button
              type="button"
              className="fpm__btn fpm__btn--pri"
              onClick={() => { setPage(1); fetchList(); }}
              disabled={loading}
            >조회</button>
          </div>

          {/* 검색 기능 */}
          <div className="fpm__row">
            <label className="fpm__label">검색어</label>
            <div className="fpm__input-wrap">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="축제명 검색"
                className="fpm__input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setPage(1);
                    fetchList();
                  }
                }}
              />
              {query && (
                <button
                  type="button"
                  className="fpm__clear"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                    fetchList();
                  }}
                  aria-label="검색어 지우기"
                >
                  ×
                </button>
              )}
            </div>
            <button
              type="button"
              className="fpm__btn fpm__btn--pri"
              onClick={() => { setPage(1); fetchList(); }}
              disabled={loading}
            >검색</button>
          </div>

          <div className="fpm__row">
            <label className="fpm__label">표시개수</label>
            <select
              value={rows}
              onChange={(e) => { setRows(Number(e.target.value)); setPage(1); }}
              className="fpm__select"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </div>
        </div>

        {/* list */}
        {error && <div className="fpm__err">{error}</div>}
        {loading ? (
          <div className="fpm__hint">불러오는 중…</div>
        ) : (
          <ul className="fpm__list" role="listbox" aria-label="축제 목록">
            {items.map((it) => (
              <li key={it.id} className="fpm__item" role="option">
                <div className="fpm__card">
                  <img
                    src={it.imageUrl || ""}
                    alt=""
                    className="fpm__thumb"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <div className="fpm__main">
                    <div className="fpm__name">{it.name}</div>
                    <div className="fpm__addr">{it.address || ""}</div>
                    <div className="fpm__date">{it.startDate} ~ {it.endDate}</div>
                  </div>
                  <div className="fpm__right">
                    <button
                      type="button"
                      className="fpm__btn fpm__btn--pri"
                      onClick={() => onPick?.({
                        title: it.name,
                        addr1: it.address || "",
                        mapx: it.lng,
                        mapy: it.lat,
                        contentid: it.id,
                        eventstartdate: it.startDate?.replaceAll("-", ""),
                        eventenddate: it.endDate?.replaceAll("-", ""),
                        firstimage: it.imageUrl || "",
                      })}
                    >선택</button>
                  </div>
                </div>
              </li>
            ))}
            {!items.length && <li className="fpm__item"><span className="fpm__hint">결과 없음</span></li>}
          </ul>
        )}

        {/* pager */}
        <div className="fpm__pager" role="navigation" aria-label="페이지네이션">
          <button
            type="button"
            className="fpm__btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >이전</button>
          <span>{page}</span>
          <button
            type="button"
            className="fpm__btn"
            onClick={() => setPage((p) => p + 1)}
            disabled={loading || items.length < rows || rows * page >= total}
          >다음</button>
          <span className="fpm__hint">총 {total}건</span>
        </div>
      </div>
    </div>
  );
}
