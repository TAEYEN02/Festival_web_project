import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchFestivalById, fetchNearbyFestivals /*, fetchRelatedFestivals */ } from "../../api/regionFestival";
import { formatDateRange, isOngoing, isUpcoming, isPast } from "../../util/date";
import "../RegionOverview/RegionOverview.css";
import "./FestivalDetail.css";
import MapView from "../RegionOverview/MapView";
import useScrap from "../RegionOverview/useScrap";
import festivalImg from "../../asset/icons/festivalImg.png";

// 파일 상단 import 아래(컴포넌트 바깥) 또는 컴포넌트 안 최상단에 추가
function renderEventText(text) {
    if (!text) return null;

    const normalized = String(text)
        .replace(/\\u003Cbr\\u003E|<br\s*\/?>/gi, "\n")
        .replace(/\r/g, "");
    const lines = normalized.split(/\n+/).map(s => s.trim()).filter(Boolean);

    const sections = [];
    let current = { title: null, items: [] };

    const isHeading = (s) =>
        (/^(메인프로그램|행사소개|행사내용)$/).test(s) || /공간$|무대$/.test(s) || /:$/.test(s);

    for (const l of lines) {
        // 1) 소제목 감지
        if (isHeading(l)) {
            if (current.title || current.items.length) sections.push(current);
            current = { title: l.replace(/:$/, ""), items: [] };
            continue;
        }
        // 2) 번호/불릿 → 리스트
        if (/^\d+[.)]\s/.test(l) || /^[-•]\s/.test(l)) {
            current.items.push(l.replace(/^\d+[.)]\s+|^[-•]\s+/, ""));
            continue;
        }
        // 3) "라벨: 내용" → <b>라벨</b>: 내용
        const m = l.match(/^([^:]+):\s*(.+)$/);
        if (m) {
            current.items.push({ label: m[1].trim(), text: m[2].trim() });
            continue;
        }
        // 4) 일반 문장
        current.items.push(l);
    }
    if (current.title || current.items.length) sections.push(current);

    return (
        <div className="detail-eventtext">
            {sections.map((sec, i) => (
                <div key={i} className="et-section">
                    {sec.title ? <h3 className="et-title">{sec.title}</h3> : null}
                    <ul className="et-list">
                        {sec.items.map((it, j) => (
                            <li key={j}>
                                {typeof it === "string"
                                    ? it
                                    : (<><b>{it.label}</b>: {it.text}</>)}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

// 헬퍼 + 배지 렌더
function formatDistance(m) {
    if (typeof m !== "number" || Number.isNaN(m)) return "";
    if (m < 1000) return `${Math.round(m)}m`;
    return `${(m / 1000).toFixed(1)}km`;
}

function walkMinutes(m) {
    if (typeof m !== "number" || Number.isNaN(m)) return "";
    const minutes = Math.max(1, Math.round(m / 70)); // 약 70m/분
    return `도보 ${minutes}분`;
}

export default function FestivalDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isScrapped, toggleScrap } = useScrap();

    const [loading, setLoading] = useState(true);
    const [festival, setFestival] = useState(null);
    const [error, setError] = useState("");

    const [nearby, setNearby] = useState([]);
    const [posterOpen, setPosterOpen] = useState(false);
    const [posterSrc, setPosterSrc] = useState("");

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

                const safe = {
                    ...data,
                    imageUrl: data.imageUrl || "",
                    lat: typeof data.lat === "number" ? data.lat : undefined,
                    lng: typeof data.lng === "number" ? data.lng : undefined,
                    description: (data.description || "").trim(),
                };

                setFestival(safe);
                setError("");

                // ⬇️ 주변 축제 호출
                if (safe.lat && safe.lng) {
                    try {
                        const list = await fetchNearbyFestivals({
                            lat: safe.lat,
                            lng: safe.lng,
                            excludeId: safe.id,
                            limit: 20
                        });
                        if (mounted) setNearby(list);
                    } catch (_) {
                        if (mounted) setNearby([]);
                    }
                }

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

    // ESC 닫기
    useEffect(() => {
        if (!posterOpen) return;
        const onKey = (e) => { if (e.key === "Escape") closePoster(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [posterOpen]);

    const activeNearby = useMemo(() => {
        return (nearby || []).filter(n =>
            isOngoing(n.startDate, n.endDate) || isUpcoming(n.startDate)
        );
    }, [nearby]);

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

    function getBadge(n) {
        if (isOngoing(n.startDate, n.endDate)) return { key: "ongoing", label: "진행중" };
        if (isUpcoming(n.startDate)) return { key: "upcoming", label: "예정" };
        return null;
    }

    const openPoster = () => {
        setPosterSrc(festival.imageUrl || "https://placehold.co/800x1200?text=Poster");
        setPosterOpen(true);
    };
    const closePoster = () => setPosterOpen(false);


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
                {/* 좌측 섹션 */}
                <section className="detail-section">
                    <h2>소개</h2>
                    {festival.description
                        ? renderEventText(festival.description)
                        : <p className="detail-desc">상세 설명이 준비 중입니다.</p>}

                    <h2>행사내용</h2>
                    {festival.detailText
                        ? renderEventText(festival.detailText)
                        : <p className="detail-desc">행사내용 정보가 없습니다.</p>}

                    <h2>지도</h2>
                    {(festival.lat && festival.lng) ? (
                        <div className="map-card">
                            <button className="btn ghost" onClick={handleDirections}>길찾기</button>
                            <MapView
                                items={[{
                                    id: festival.id,
                                    name: festival.name,
                                    address: festival.address,
                                    lat: festival.lat,
                                    lng: festival.lng
                                }]}
                            />
                        </div>
                    ) : (
                        <p className="detail-desc">위치 정보가 없습니다.</p>
                    )}
                </section>

                {/* 우측 aside */}
                <aside className="detail-aside">
                    <div className="aside-card">
                        <h3>포스터</h3>
                        <div className="aside-poster">
                            <img
                                src={festival.imageUrl || festivalImg}
                                alt={festival.name}
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = festivalImg;
                                }}
                                onClick={openPoster}                 // ← 추가
                                style={{ cursor: "zoom-in" }}        // ← 선택 사항
                            />
                        </div>
                        <div className="aside-addr">{festival.address || "-"}</div>
                    </div>

                    <div className="aside-card">
                        <h3>기본 정보</h3>
                        <ul className="kv">
                            <li><span>지역</span><b>{festival.region}</b></li>
                            <li><span>기간</span><b>{formatDateRange(festival.startDate, festival.endDate) || "-"}</b></li>
                            {festival.tel ? <li><span>문의</span><b>{festival.tel}</b></li> : null}
                            {festival.modified ? <li><span>수정일</span><b>{festival.modified}</b></li> : null}
                        </ul>
                    </div>
                </aside>
            </div>

            {/* 연관(주변) 축제 */}
            <section className="detail-related">
                <div className="related-head">
                    <h2>이 근처의 다른 축제</h2>
                    <Link className="link-more" to={`/overview?region=${encodeURIComponent(festival.region)}&view=single`}>
                        해당 지역 더 보기 →
                    </Link>
                </div>

                {activeNearby.length === 0 ? (
                    <div className="empty-state" style={{ marginTop: 8 }}>
                        <div className="empty-emoji" aria-hidden>🗺️</div>
                        <div className="empty-text">주변에 진행/예정 축제가 없어요.</div>
                    </div>
                ) : (
                    <div className="poster-scroll">
                        {activeNearby.map(n => {
                            const badge = getBadge(n);
                            return (
                                <Link key={n.id} to={`/festival/${n.id}`} className="poster-card">
                                    <div className="poster-thumb">
                                        {badge && <span className={`poster-badge ${badge.key}`}>{badge.label}</span>}
                                        {typeof n.distance === "number" && (
                                            <>
                                                <span className="poster-dist">{formatDistance(n.distance)}</span>
                                                <span className="poster-walk">{walkMinutes(n.distance)}</span>
                                            </>
                                        )}
                                        <img
                                            src={n.imageUrl || "https://placehold.co/200x260?text=Poster"}
                                            alt={n.name}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src = "https://placehold.co/200x260?text=Poster";
                                            }}
                                        />
                                    </div>
                                    <div className="poster-meta">
                                        <div className="poster-name" title={n.name}>{n.name}</div>
                                        <div className="poster-date">{formatDateRange(n.startDate, n.endDate)}</div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
            {posterOpen && (
                <div className="poster-modal" role="dialog" aria-modal="true" onClick={closePoster}>
                    <div className="poster-backdrop"></div>
                    <div className="poster-dialog" onClick={(e) => e.stopPropagation()}>
                        <button className="poster-close" onClick={closePoster} aria-label="닫기">✕</button>
                        <img src={posterSrc} alt={`${festival.name} 포스터 확대`} />
                    </div>
                </div>
            )}
        </div>
    );
}
