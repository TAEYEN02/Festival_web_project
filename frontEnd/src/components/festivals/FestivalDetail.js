import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchFestivalById /*, fetchRelatedFestivals */ } from "../../api/regionFestival";
import { formatDateRange, isOngoing, isUpcoming, isPast } from "../../util/date";
import "../RegionOverview/RegionOverview.css";
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

                // 이미지/좌표 등 안전 보정
                const safe = {
                    ...data,
                    imageUrl: data.imageUrl || "",
                    lat: typeof data.lat === "number" ? data.lat : undefined,
                    lng: typeof data.lng === "number" ? data.lng : undefined,
                    description: (data.description || "").trim(),
                };

                setFestival(safe);
                setError("");

                // 연관 축제는 필요 시 해제
                // const rel = await fetchRelatedFestivals({ region: safe.region, excludeId: safe.id, limit: 8 });
                // if (!mounted) return;
                // setRelated(rel);
            } catch (e) {
                if (!mounted) return;
                setError(e?.message || "상세 조회 중 오류가 발생했습니다.");
                setFestival(null);
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
                {/* {festival.imageUrl ? (
                    <img
                        src={festival.imageUrl}
                        alt={festival.name}
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://placehold.co/1200x540?text=Festival";
                        }}
                    />
                ) : (
                    <img
                        src="https://placehold.co/1200x540?text=Festival"
                        alt="Festival"
                    />
                )} */}
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
                    <span className="detail-date">
                        {formatDateRange(festival.startDate, festival.endDate) || "일정 미정"}
                    </span>
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

                    {/* 댓글/리뷰 + 지도 */}
                    <div className="detail-comments">
                        <h2>댓글/리뷰 (예정)</h2>
                        <div className="pending">
                            로그인 + 서버 API 연동 후 제공될 예정입니다.
                        </div>

                        {/* ⬇️ 여기 지도 배치 */}
                        {(festival.lat && festival.lng) ? (
                            <div className="comments-map" style={{ marginTop: 16 }}>
                                <h3 style={{ margin: "0 0 8px" }}>지도</h3>
                                <div className="comments-map-box" style={{ height: 320 }}>
                                    <MapView
                                        lat={festival.lat}
                                        lng={festival.lng}
                                        markers={[{ lat: festival.lat, lng: festival.lng, label: festival.name }]}
                                        height={320}
                                        zoom={14}
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>
                </section>

                {/* 우측 aside의 첫 번째 카드 교체: 지도 → 포스터 */}
                <aside className="detail-aside">
                    <div className="aside-card">
                        <h3>포스터</h3>
                        <div className="aside-poster">
                            {festival.imageUrl ? (
                                <img
                                    src={festival.imageUrl}
                                    alt={festival.name}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = "https://placehold.co/480x320?text=Festival+Poster";
                                    }}
                                />
                            ) : (
                                <img
                                    src="https://placehold.co/480x320?text=Festival+Poster"
                                    alt="Festival Poster"
                                />
                            )}
                        </div>
                        <div className="aside-addr">{festival.address || "-"}</div>
                    </div>

                    <div className="aside-card">
                        <h3>기본 정보</h3>
                        <ul className="kv">
                            <li><span>지역</span><b>{festival.region}</b></li>
                            <li><span>기간</span><b>{formatDateRange(festival.startDate, festival.endDate) || "-"}</b></li>
                            <li><span>인기도</span><b>{festival.popularity ?? "-"}</b></li>
                            {festival.tel ? <li><span>문의</span><b>{festival.tel}</b></li> : null}
                            {festival.modified ? <li><span>수정일</span><b>{festival.modified}</b></li> : null}
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
                                        src={r.imageUrl || "https://placehold.co/320x180?text=Festival"}
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
