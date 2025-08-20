import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./RegionOverview.css";
import { fetchFestivals, fetchFestivalsPage, REGIONS } from "../../api/regionFestival.js";
import RegionFestivalCard from "./RegionFestivalCard.js";
import RegionFilter from "./RegionFilter";
import EmptyState from "./EmptyState";
import MapView from "./MapView";
import useScrap from "./useScrap";
import { toMonthKey } from "../../util/date.js";

const PAGE_SIZE = 20; // 페이지 크기 고정(드롭다운 제거)

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
    const [hasNext, setHasNext] = useState(true);
    const [total, setTotal] = useState(0);

    // URL → 상태 복원 (size 관련 로직 제거)
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

        setQuery(initQ);
        setRegion(initRegion);
        setSort(initSort);
        setGroupView(initView);
        setStatusFilter(initStatus);
        setMonthFilter(initMonth);
        setSelectedTags(initTags);
        setViewMode(initMode === "map" ? "map" : "list");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 상태 → URL 동기화 (size 파라미터 제거)
    useEffect(() => {
        setSearchParams({
            q: query || "",
            region: groupView ? "all" : region,
            sort,
            view: groupView ? "group" : "single",
            status: statusFilter,
            month: monthFilter,
            tags: selectedTags.join(","),
            mode: viewMode
        });
    }, [query, region, sort, groupView, statusFilter, monthFilter, selectedTags, viewMode, setSearchParams]);

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
                size: PAGE_SIZE
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
    }, [groupView, query, region, sort, statusFilter, monthFilter, selectedTags]);

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

                    {/* 상태 드롭다운(버튼 탭 → select로 변경) */}
                    <select
                        className="select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label="진행 상태"
                        title="진행 상태"
                    >
                        <option value="all">전체</option>
                        <option value="ongoing">진행중</option>
                        <option value="upcoming">예정</option>
                        <option value="past">종료</option>
                    </select>

                    {/* 월 필터 (퀵 버튼 제거, 드롭다운만 유지) */}
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

                    {/* 페이지 크기 드롭다운 제거됨 */}
                </div>
            </div>

            {!groupView && (
                <RegionFilter value={region} onChange={(v) => setRegion(v)} />
            )}

            {/* 선택된 태그 */}
            {selectedTags.length > 0 && (
                <div className="selected-tags">
                    {selectedTags.map(t => (
                        <button
                            key={t}
                            className="chip on"
                            onClick={() => handleTagClick(t)}
                            title={`태그 '${t}' 해제`}
                        >
                            #{t} ✕
                        </button>
                    ))}
                    <button
                        className="chip clear"
                        onClick={() => setSelectedTags([])}
                        title="태그 전체 해제"
                    >
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
                                                    <RegionFestivalCard
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
                                            <RegionFestivalCard
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

                                    {/* 총 개수 안내(페이지 크기 표기 제거) */}
                                    <div style={{ textAlign: "center", color: "#666", marginTop: 8 }}>
                                        총 {total}개 중 {listItems.length}개 표시
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
