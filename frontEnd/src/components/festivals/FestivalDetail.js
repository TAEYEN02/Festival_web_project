import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchFestivalById, fetchRelatedFestivals } from "../../api/regionFestival";
import { formatDateRange, isOngoing, isUpcoming, isPast } from "../../util/date"
import "../RegionOverview/RegionOverview.css"; // 카드/버튼 재활용
import "./FestivalDetail.css";
import MapView from "../RegionOverview/MapView";
import useScrap from "../RegionOverview/useScrap";

export default function FestivalDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isScrapped, toggleScrap } = useScrap();

    const [loading, setLoading] = useState(true);
    const [festival, setFestival] = useState(null);
    const [error, setError] = useState("");
    const [related, setRelated] = useState([]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const data = await fetchFestivalById(id);
                if (!mounted) return;
                if (!data) {
                    setError("해당 ID의 축제 정보를 찾을 수 없어요.");
                    setFestival(null);
                    return;
                }
                setFestival(data);
                setError("");

                // 연관 축제
                const rel = await fetchRelatedFestivals({ region: data.region, excludeId: data.id, limit: 8 });
                if (!mounted) return;
                setRelated(rel);
            } catch (e) {
                console.error(e);
                if (!mounted) return;
                setError("축제 상세를 불러오는 중 문제가 발생했어요.");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    const status = useMemo(() => {
        if (!festival) return null;
        if (isOngoing(festival.startDate, festival.endDate)) return { key: "ongoing", label: "진행중" };
        if (isUpcoming(festival.startDate)) return { key: "upcoming", label: "예정" };
        if (isPast(festival.endDate ?? festival.startDate)) return { key: "past", label: "종료" };
        return null;
    }, [festival]);

    const handleDirections = () => {
        if (!festival?.address) return;
        const q = encodeURIComponent(festival.address);
        window.open(`https://map.naver.com/v5/search/${q}`, "_blank");
    };

    const handleTagClick = (t) => {
        navigate(`/overview?tags=${encodeURIComponent(t)}`);
    };

    if (loading) {
        return (
            <div className="detail-wrap">
                <div className="detail-skel hero" />
                <div className="detail-grid">
                    <div className="detail-skel box" />
                    <div className="detail-skel box" />
                </div>
            </div>
        );
    }

    if (error || !festival) {
        return (
            <div className="detail-wrap">
                <p className="detail-error">⚠️ {error || "정보를 표시할 수 없어요."}</p>
                <p><Link to="/overview">← 한눈에 보기로 돌아가기</Link></p>
            </div>
        );
    }

    return (
        <div className="detail-wrap">
            {/* 히어로 영역 */}
            <div className="detail-hero">
                <img
                    src={festival.imageUrl}
                    alt={festival.name}
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://placehold.co/1200x540?text=Festival";
                    }}
                />
                <button
                    className={`scrap-fab ${isScrapped(festival.id) ? "on" : ""}`}
                    onClick={() => toggleScrap(festival.id)}
                    aria-label="스크랩 토글"
                    title="스크랩"
                >
                    {isScrapped(festival.id) ? "★" : "☆"}
                </button>
            </div>

            {/* 기본 정보 */}
            <div className="detail-head">
                <h1 className="detail-title">{festival.name}</h1>
                <div className="detail-meta">
                    <span className="detail-date">{formatDateRange(festival.startDate, festival.endDate)}</span>
                    {status && <span className={`status-badge ${status.key}`}>{status.label}</span>}
                </div>
                <div className="detail-tags">
                    {(festival.tags || []).map((t) => (
                        <button key={t} className="chip" onClick={() => handleTagClick(t)} title={`태그 '${t}'로 이동`}>
                            #{t}
                        </button>
                    ))}
                </div>
            </div>

            {/* 본문 그리드 */}
            <div className="detail-grid">
                {/* 좌: 설명/액션 */}
                <section className="detail-section">
                    <h2>소개</h2>
                    <p className="detail-desc">
                        {festival.description || "상세 설명이 준비 중입니다."}
                    </p>

                    <div className="detail-actions">
                        <button className="btn ghost" onClick={handleDirections}>길찾기</button>
                        {festival.ticketUrl && (
                            <a className="btn primary" href={festival.ticketUrl} target="_blank" rel="noreferrer">
                                예매하기(YES24)
                            </a>
                        )}
                    </div>

                    {/* 댓글/리뷰 예정 자리 */}
                    <div className="detail-comments">
                        <h2>댓글/리뷰 (예정)</h2>
                        <div className="pending">
                            로그인 + 서버 API 연동 후 제공될 예정입니다.
                        </div>
                    </div>
                </section>

                {/* 우: 지도/기본정보 */}
                <aside className="detail-aside">
                    <div className="aside-card">
                        <h3>위치</h3>
                        <div className="aside-map">
                            <MapView items={[festival]} />
                        </div>
                        <div className="aside-addr">{festival.address || "-"}</div>
                    </div>

                    <div className="aside-card">
                        <h3>기본 정보</h3>
                        <ul className="kv">
                            <li><span>지역</span><b>{festival.region}</b></li>
                            <li><span>기간</span><b>{formatDateRange(festival.startDate, festival.endDate)}</b></li>
                            <li><span>인기도</span><b>{festival.popularity ?? "-"}</b></li>
                        </ul>
                    </div>
                </aside>
            </div>

            {/* 연관 축제 */}
            <section className="detail-related">
                <div className="related-head">
                    <h2>이 지역의 다른 축제</h2>
                    <Link className="link-more" to={`/overview?region=${encodeURIComponent(festival.region)}&view=single`}>
                        해당 지역 더 보기 →
                    </Link>
                </div>
                {related.length === 0 ? (
                    <div className="empty-state" style={{ marginTop: 8 }}>
                        <div className="empty-emoji" aria-hidden>🗺️</div>
                        <div className="empty-text">연관 축제가 없어요.</div>
                    </div>
                ) : (
                    <div className="related-row">
                        {related.map(r => (
                            <Link key={r.id} to={`/festival/${r.id}`} className="related-card">
                                <div className="thumb">
                                    <img
                                        src={r.imageUrl}
                                        alt={r.name}
                                        loading="lazy"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "https://placehold.co/320x180?text=Festival";
                                        }}
                                    />
                                </div>
                                <div className="body">
                                    <div className="name" title={r.name}>{r.name}</div>
                                    <div className="date">{formatDateRange(r.startDate, r.endDate)}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
