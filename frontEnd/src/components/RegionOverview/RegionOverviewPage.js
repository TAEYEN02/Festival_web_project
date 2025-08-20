import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./RegionOverview.css";
import { fetchFestivals, fetchFestivalsPage, REGIONS } from "../../api/festivals";
import FestivalCard from "./FestivalCard";
import RegionFilter from "./RegionFilter";
import EmptyState from "./EmptyState";
import MapView from "./MapView";
import useScrap from "./useScrap";
import { toMonthKey } from "../../util/date.js";

export default function RegionOverviewPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { isScrapped, toggleScrap } = useScrap();

    // 상태
    const [query, setQuery] = useState("");
    const [region, setRegion] = useState("all");
    const [sort, setSort] = useState("popular"); // 'popular' | 'latest'
    const [groupView, setGroupView] = useState(true); // 전체(그룹) / 단일
    const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'ongoing' | 'upcoming' | 'past'
    const [monthFilter, setMonthFilter] = useState("all"); // 'all' | 'YYYY-MM'
    const [selectedTags, setSelectedTags] = useState([]); // 다중 태그
    const [viewMode, setViewMode] = useState("list"); // 'list' | 'map'

    // 데이터 (단일 모드: 서버 페이징)
    const [loading, setLoading] = useState(false);
    const [groupItems, setGroupItems] = useState([]);        // 그룹 모드용 전체(필터적용)
    const [listItems, setListItems] = useState([]);          // 단일 모드 누적
    const [page, setPage] = useState(0);                     // 0-based
    const [size, setSize] = useState(20);                    // ★ 페이지 크기(12/20/40)
    const [hasNext, setHasNext] = useState(true);
    const [total, setTotal] = useState(0);

    // URL → 상태 복원
    useEffect(() => {
        const initQ = searchParams.get("q") ?? "";
        const initRegion = searchParams.get("region") ?? "all";
        const initSort = searchParams.get("sort") ?? "popular";
        const initView = (searchParams.get("view") ?? "group") === "group";
        const initStatus = searchParams.get("status") ?? "all";
        const initMonth = searchParams.get("month") ?? "all";
        const initTags = (searchParams.get("tags") ?? "")
            .split(",").map(s => s.trim()).filter(Boolean);
        const initMode = searchParams.get("mode") ?? "list";
        const initSizeRaw = parseInt(searchParams.get("size") ?? "20", 10);
        const initSize = [12, 20, 40].includes(initSizeRaw) ? initSizeRaw : 20;

        setQuery(initQ);
        setRegion(initRegion);
        setSort(initSort);
        setGroupView(initView);
        setStatusFilter(initStatus);
        setMonthFilter(initMonth);
        setSelectedTags(initTags);
        setViewMode(initMode === "map" ? "map" : "list");
        setSize(initSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 상태 → URL 동기화
    useEffect(() => {
        setSearchParams({
            q: query || "",
            region: groupView ? "all" : region,
            sort,
            view: groupView ? "group" : "single",
            status: statusFilter,
            month: monthFilter,
            tags: selectedTags.join(","),
            mode: viewMode,
            size: String(size) // ★ size 동기화
        });
    }, [query, region, sort, groupView, statusFilter, monthFilter, selectedTags, viewMode, size, setSearchParams]);

    // 그룹(전체) 모드: 한 번에 가져와서 섹션별 8개씩
    useEffect(() => {
        if (!groupView) return;
        (async () => {
            setLoading(true);
            try {
                const data = await fetchFestivals({
                    query,
                    region: "all",
                    sort,
                    status: statusFilter,
                    month: monthFilter,
                    tags: selectedTags
                });
                setGroupItems(data);
            } catch (e) {
                console.error(e);
                setGroupItems([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [groupView, query, sort, statusFilter, monthFilter, selectedTags]);

    // 단일 모드: 서버 페이징 기반(모의)으로 페이지 append
    const resetAndLoadFirst = () => {
        setListItems([]);
        setPage(0);
        setHasNext(true);
        setTotal(0);
        loadNextPage(0, true);
    };

    const loadNextPage = async (nextPage = page, isFirst = false) => {
        if (loading || (!hasNext && !isFirst)) return;
        setLoading(true);
        try {
            const res = await fetchFestivalsPage({
                query,
                region,
                sort,
                status: statusFilter,
                month: monthFilter,
                tags: selectedTags,
                page: nextPage,
                size
            });
            setListItems(prev => isFirst ? res.items : [...prev, ...res.items]);
            setPage(res.page + 1);      // 다음 로딩을 위해 +1
            setHasNext(res.hasNext);
            setTotal(res.total ?? 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // 단일 모드에서 조건 바뀌면 초기화 후 첫 페이지 로드
    useEffect(() => {
        if (groupView) return;
        resetAndLoadFirst();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupView, query, region, sort, statusFilter, monthFilter, selectedTags, size]);

    // 월 옵션(데이터 기반, 그룹/단일 각각 현재 로드분 기준)
    const monthOptions = useMemo(() => {
        const source = groupView ? groupItems : listItems;
        const set = new Set();
        source.forEach(f => {
            if (f.startDate) set.add(toMonthKey(f.startDate));
        });
        const arr = Array.from(set).filter(Boolean).sort();
        return ["all", ...arr];
    }, [groupView, groupItems, listItems]);

    // 그룹 뷰 묶음
    const grouped = useMemo(() => {
        const map = new Map();
        REGIONS.forEach(r => map.set(r.key, []));
        groupItems.forEach(f => {
            if (!map.has(f.region)) map.set(f.region, []);
            map.get(f.region).push(f);
        });
        return map;
    }, [groupItems]);

    // 무한 스크롤 센티넬
    const sentinelRef = useRef(null);
    useEffect(() => {
        if (groupView || viewMode === "map") return; // 단일·리스트에서만
        const node = sentinelRef.current;
        if (!node) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    loadNextPage();
                }
            });
        }, { rootMargin: "200px 0px" });
        io.observe(node);
        return () => io.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupView, viewMode, loading, hasNext, page]);

    // 빠른 월 칩
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const ymNext = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;

    // 태그 토글
    const handleTagClick = (tag) => {
        setSelectedTags((prev) => {
            if (prev.includes(tag)) return prev.filter(t => t !== tag);
            return [...prev, tag];
        });
        if (!groupView) resetAndLoadFirst();
    };

    // 그룹 → 단일 지역 점프
    const jumpToRegion = (k) => {
        setGroupView(false);
        setRegion(k);
        resetAndLoadFirst();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="overview-wrap">
            <div className="overview-header">
                <h1>한눈에 보기</h1>
                <p className="sub">
                    지역별 축제를 빠르게 탐색하세요. (인기·최신, 상태/월/태그, 리스트·지도, 서버 페이징)
                </p>
            </div>

            {/* 툴바 */}
            <div className="toolbar">
                <div className="search">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="축제명, 지역, 태그로 검색"
                        aria-label="축제 검색"
                    />
                </div>

                <div className="controls">
                    <div className="toggle">
                        <button
                            className={`toggle-btn ${groupView ? "active" : ""}`}
                            onClick={() => setGroupView(true)}
                            title="전체(그룹)"
                        >
                            전체(그룹)
                        </button>
                        <button
                            className={`toggle-btn ${!groupView ? "active" : ""}`}
                            onClick={() => setGroupView(false)}
                            title="단일 지역"
                        >
                            단일 지역
                        </button>
                    </div>

                    <div className="toggle mode">
                        <button
                            className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
                            onClick={() => setViewMode("list")}
                            title="리스트"
                        >
                            리스트
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === "map" ? "active" : ""}`}
                            onClick={() => setViewMode("map")}
                            title="지도"
                        >
                            지도
                        </button>
                    </div>

                    <select
                        className="select"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        aria-label="정렬"
                    >
                        <option value="popular">인기순</option>
                        <option value="latest">최신순</option>
                    </select>

                    {/* 상태 라디오 탭 */}
                    <div className="status-tabs" role="tablist" aria-label="진행 상태">
                        {[
                            { v: "all", label: "전체" },
                            { v: "ongoing", label: "진행중" },
                            { v: "upcoming", label: "예정" },
                            { v: "past", label: "종료" }
                        ].map(s => (
                            <button
                                key={s.v}
                                className={`status-tab ${statusFilter === s.v ? "active" : ""}`}
                                onClick={() => setStatusFilter(s.v)}
                                role="tab"
                                aria-selected={statusFilter === s.v}
                                title={s.label}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* 월 필터 + 퀵칩 */}
                    <div className="month-block">
                        <select
                            className="select"
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            aria-label="월 필터"
                            title="월별"
                        >
                            {monthOptions.map(m => (
                                <option key={m} value={m}>
                                    {m === "all" ? "전체 월" : m}
                                </option>
                            ))}
                        </select>
                        <div className="month-quick">
                            <button
                                className={`chip ${monthFilter === ym ? "on" : ""}`}
                                onClick={() => setMonthFilter(ym)}
                                title="이번 달"
                            >
                                이번 달
                            </button>
                            <button
                                className={`chip ${monthFilter === ymNext ? "on" : ""}`}
                                onClick={() => setMonthFilter(ymNext)}
                                title="다음 달"
                            >
                                다음 달
                            </button>
                            <button
                                className={`chip ${monthFilter === "all" ? "on" : ""}`}
                                onClick={() => setMonthFilter("all")}
                                title="전체 월"
                            >
                                전체
                            </button>
                        </div>
                    </div>

                    {/* ★ 페이지 크기 선택 (단일·리스트 모드에서만 활성화) */}
                    <select
                        className="select"
                        value={size}
                        onChange={(e) => setSize(parseInt(e.target.value, 10))}
                        aria-label="페이지 크기"
                        title="페이지 크기"
                        disabled={groupView || viewMode === "map"}
                    >
                        <option value={12}>12개</option>
                        <option value={20}>20개</option>
                        <option value={40}>40개</option>
                    </select>
                </div>
            </div>

            {!groupView && (
                <RegionFilter value={region} onChange={(v) => setRegion(v)} />
            )}

            {/* 선택된 태그 */}
            {selectedTags.length > 0 && (
                <div className="selected-tags">
                    {selectedTags.map(t => (
                        <button key={t} className="chip on" onClick={() => handleTagClick(t)} title={`태그 '${t}' 해제`}>
                            #{t} ✕
                        </button>
                    ))}
                    <button className="chip clear" onClick={() => setSelectedTags([])} title="태그 전체 해제">
                        태그 초기화
                    </button>
                </div>
            )}

            {/* 본문 */}
            {loading && groupView ? (
                <div className="skeleton-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div className="skeleton-card" key={i} />
                    ))}
                </div>
            ) : (
                <>
                    {groupView ? (
                        <div className="group-stack">
                            {REGIONS.map(r => {
                                const list = (grouped.get(r.key) || []);
                                if (list.length === 0) return null;
                                return (
                                    <section className="region-section" key={r.key} id={`section-${r.key}`}>
                                        <div className="region-head">
                                            <h2>{r.label} <span className="count-badge">{list.length}</span></h2>
                                            <button className="link-more" onClick={() => jumpToRegion(r.key)}>
                                                더 보기 →
                                            </button>
                                        </div>
                                        {viewMode === "map" ? (
                                            <MapView items={list} />
                                        ) : (
                                            <div className="card-grid">
                                                {list.slice(0, 8).map(f => (
                                                    <FestivalCard
                                                        key={f.id}
                                                        festival={f}
                                                        onTagClick={handleTagClick}
                                                        isScrapped={isScrapped}
                                                        onToggleScrap={toggleScrap}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                );
                            })}
                            {groupItems.length === 0 && (
                                <EmptyState />
                            )}
                        </div>
                    ) : (
                        <>
                            {/* 단일 모드 */}
                            {listItems.length === 0 && !loading ? (
                                <EmptyState />
                            ) : viewMode === "map" ? (
                                <MapView items={listItems} />
                            ) : (
                                <>
                                    <div className="card-grid">
                                        {listItems.map(f => (
                                            <FestivalCard
                                                key={f.id}
                                                festival={f}
                                                onTagClick={handleTagClick}
                                                isScrapped={isScrapped}
                                                onToggleScrap={toggleScrap}
                                            />
                                        ))}
                                    </div>

                                    {/* 무한 스크롤 센티넬 */}
                                    {hasNext && (
                                        <div ref={sentinelRef} className="infinite-sentinel" aria-hidden />
                                    )}

                                    {/* 안전망: 더 보기 버튼 & 로딩 표시 */}
                                    <div className="more-wrap">
                                        {hasNext && (
                                            <button className="btn ghost" onClick={() => loadNextPage()}>
                                                더 보기
                                            </button>
                                        )}
                                        {loading && (
                                            <span style={{ marginLeft: 8, color: "#666" }}>불러오는 중…</span>
                                        )}
                                    </div>

                                    {/* 총 개수 안내(서버 페이징 대비) */}
                                    <div style={{ textAlign: "center", color: "#666", marginTop: 8 }}>
                                        총 {total}개 중 {listItems.length}개 표시 (페이지 크기: {size})
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}
