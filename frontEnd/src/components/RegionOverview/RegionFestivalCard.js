import { useNavigate } from "react-router-dom";
import { formatDateRange, isOngoing, isUpcoming, isPast } from "../../util/date.js";

function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function highlightText(text, keyword) {
    if (!keyword) return text;
    const safe = escapeRegExp(String(keyword));
    if (!safe) return text;
    const re = new RegExp(`(${safe})`, "gi");
    const parts = String(text ?? "").split(re);
    return parts.map((part, i) => (re.test(part) ? <mark key={i}>{part}</mark> : part));
}

export default function FestivalCard({ festival, onTagClick, isScrapped, onToggleScrap, query = "" }) {
    const {
        id,
        name,
        imageUrl,
        startDate,
        endDate,
        address,
        tags = [],
        ticketUrl
    } = festival || {};

    const navigate = useNavigate();

    const handleDirections = (e) => {
        e.stopPropagation();
        if (!address) return;
        const q = encodeURIComponent(address);
        window.open(`https://map.naver.com/v5/search/${q}`, "_blank");
    };

    const status = (() => {
        if (isOngoing(startDate, endDate)) return { key: "ongoing", label: "진행중" };
        if (isUpcoming(startDate)) return { key: "upcoming", label: "예정" };
        if (isPast(endDate ?? startDate)) return { key: "past", label: "종료" };
        return null;
    })();

    const goDetail = () => {
        if (!id) return;
        navigate(`/festival/${id}`);
    };

    return (
        <div
            className="festival-card"
            onClick={goDetail}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") goDetail(); }}
        >
            <div className="festival-thumb">
                <img
                    src={imageUrl}
                    alt={name}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://placehold.co/600x338?text=Festival";
                    }}
                />
                <div className="festival-chip-row">
                    {status && (
                        <span className={`status-badge ${status.key}`}>{status.label}</span>
                    )}
                    {tags.slice(0, 3).map((t) => (
                        <button
                            key={t}
                            className="festival-chip chip-btn"
                            onClick={(e) => { e.stopPropagation(); onTagClick?.(t); }}
                            title={`태그 '${t}'로 필터`}
                        >
                            #{t}
                        </button>
                    ))}
                </div>
                <button
                    className={`scrap-btn ${isScrapped?.(id) ? "on" : ""}`}
                    aria-label="스크랩 토글"
                    onClick={(e) => { e.stopPropagation(); onToggleScrap?.(id); }}
                    title="스크랩"
                >
                    {isScrapped?.(id) ? "★" : "☆"}
                </button>
            </div>

            <div className="festival-body">
                <h3 className="festival-title" title={name}>
                    {highlightText(name, query)}
                </h3>
                <div className="festival-date">{formatDateRange(startDate, endDate)}</div>
                {address && (
                    <div className="festival-addr" title={address}>
                        {highlightText(address, query)}
                    </div>
                )}
                <div className="festival-actions">
                    <button className="btn ghost" onClick={handleDirections} aria-label="길찾기 열기">길찾기</button>
                    {ticketUrl && (
                        <a
                            className="btn primary"
                            href={ticketUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                        >
                            예매하기
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
