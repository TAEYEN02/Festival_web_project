import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./RegionOverview.css";
import { fetchFestivals, fetchFestivalsPage, REGIONS } from "../../api/regionFestival.js";
import RegionFestivalCard from "./RegionFestivalCard.js";
import RegionFilter from "./RegionFilter";
import EmptyState from "./EmptyState";
import MapView from "./MapView";
import useScrap from "./useScrap";

const PAGE_SIZE = 20; // 페이지 크기 고정(드롭다운 제거)
const DEBOUNCE_MS = 250; // 

export default function RegionOverviewPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { isScrapped, toggleScrap } = useScrap();

    // 상태
    const [query, setQuery] = useState("");
    const [queryDraft, setQueryDraft] = useState(""); // 타이핑 버퍼(디바운스 원본)
    const [isComposing, setIsComposing] = useState(false);         // IME 조합 상태
    const [region, setRegion] = useState("all");
    const [sort, setSort] = useState("default"); // 기본: 진행중(종료일↑) → 예정(시작일↑)
    const [groupView, setGroupView] = useState(true); // 전체(그룹) / 단일
    const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'ongoing' | 'upcoming' | 'past'
    const [monthFilter, setMonthFilter] = useState("all");   // 'all' | '1'..'12'
    const [selectedTags, setSelectedTags] = useState([]);    // 다중 태그
    const [viewMode, setViewMode] = useState("list");        // 'list' | 'map'
    const [includePast, setIncludePast] = useState(false); // 종료 포함 토글

    // 데이터
    const [loading, setLoading] = useState(false);
    const [groupItems, setGroupItems] = useState([]); // 그룹 모드용
    const [items, setItems] = useState([]);           // 단일 모드: 현재 페이지 아이템
    const [total, setTotal] = useState(0);            // 단일 모드: 필터 후 전체 개수

    // 페이징
    const [page, setPage] = useState(0);             // 0-based

    const requestSeqRef = React.useRef(0);
    const [recentSearches, setRecentSearches] = useState([]);

    const POPULAR_TAGS = ["야시장", "불꽃놀이", "벚꽃", "음악", "지역특산", "축제한정"];
    const [recentTagChips, setRecentTagChips] = useState([]);

    // URL → 상태 복원
    useEffect(() => {
        const initQ = searchParams.get("q") ?? "";
        const initRegion = searchParams.get("region") ?? "all";
        const initSort = searchParams.get("sort") ?? "default";
        const initView = (searchParams.get("view") ?? "group") === "group";
        const initStatus = searchParams.get("status") ?? "all";
        const initMonth = searchParams.get("month") ?? "all";
        const initTags = (searchParams.get("tags") ?? "")
            .split(",").map(s => s.trim()).filter(Boolean);
        const initMode = searchParams.get("mode") ?? "list";
        const initIncludePast = (searchParams.get("includePast") ?? "0") === "1";

        setQuery(initQ);
        setQueryDraft(initQ);
        setRegion(initRegion);
        setSort(initSort);
        setGroupView(initView);
        setStatusFilter(initStatus);
        setMonthFilter(initMonth);
        setSelectedTags(initTags);
        setViewMode(initMode === "map" ? "map" : "list");
        setIncludePast(initIncludePast);
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
            includePast: includePast ? "1" : "0",
        }, { replace: true });    // ✅ 히스토리 덮어쓰기
    }, [query, region, sort, groupView, statusFilter, monthFilter, selectedTags, viewMode, includePast, setSearchParams]);

    // 그룹(전체) 모드: 한 번에 가져와서 섹션별 8개씩
    useEffect(() => {
        if (!groupView) return;

        const mySeq = ++requestSeqRef.current;
        const ctrl = new AbortController();

        (async () => {
            setLoading(true);
            try {
                const data = await fetchFestivals({
                    query,
                    region: "all",
                    sort,
                    status: statusFilter,
                    month: monthFilter,
                    tags: selectedTags,
                    signal: ctrl.signal,
                    includePast,
                });
                // ✅ 최신 요청만 반영
                if (requestSeqRef.current === mySeq) {
                    setGroupItems(data);
                }
            } catch (e) {
                if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
                    console.error(e);
                }
                if (requestSeqRef.current === mySeq) {
                    setGroupItems([]);
                }
            } finally {
                if (requestSeqRef.current === mySeq) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            ctrl.abort();
        };
    }, [groupView, query, sort, statusFilter, monthFilter, selectedTags, includePast]);

    // 단일(지역 선택) 모드: 페이지네이션 로드
    useEffect(() => {
        if (groupView) return;

        const mySeq = ++requestSeqRef.current; // 최신 요청 번호
        const ctrl = new AbortController();

        (async () => {
            setLoading(true);
            try {
                const { items: pageItems, total } = await fetchFestivalsPage({
                    query,
                    region,
                    sort,
                    status: statusFilter,
                    month: monthFilter,
                    tags: selectedTags,
                    page,
                    size: PAGE_SIZE,
                    signal: ctrl.signal,
                    includePast,
                });

                if (requestSeqRef.current === mySeq) {
                    setItems(pageItems);
                    setTotal(total ?? 0);
                }
            } catch (e) {
                if (e?.name !== "CanceledError" && e?.name !== "AbortError") {
                    console.error(e);
                }
                if (requestSeqRef.current === mySeq) {
                    setItems([]);
                    setTotal(0);
                }
            } finally {
                if (requestSeqRef.current === mySeq) {
                    setLoading(false);
                }
            }
        })();
        return () => {
            ctrl.abort();
        };
    }, [groupView, query, region, sort, statusFilter, monthFilter, selectedTags, page, includePast]);

    // 필터 변경 시 페이지 초기화
    useEffect(() => {
        setPage(0);
    }, [groupView, query, region, sort, statusFilter, monthFilter, selectedTags, includePast]);

    useEffect(() => {
        const v = queryDraft.trim();

        // ✅ 입력을 싹 지웠을 때는 지연 없이 즉시 반영
        if (v === "") {
            setQuery("");
            return;
        }

        // ✅ 그 외에는 250ms 디바운스
        const t = setTimeout(() => {
            setQuery(v);
        }, DEBOUNCE_MS);

        return () => clearTimeout(t);
    }, [queryDraft]);

    // mount 시 최근 태그 복원
    useEffect(() => {
        const saved = localStorage.getItem("recentTagChips");
        if (saved) {
            try { setRecentTagChips(JSON.parse(saved)); } catch (_) { }
        }
    }, []);

    // mount 시 최근 검색어 복원
    useEffect(() => {
        const saved = localStorage.getItem("recentSearches");
        if (saved) {
            try { setRecentSearches(JSON.parse(saved)); } catch (_) { }
        }
    }, []);

    // 월 옵션: 고정(간단)
    const monthOptions = useMemo(() => {
        const arr = [{ value: "all", label: "전체 월" }];
        for (let m = 1; m <= 12; m++) arr.push({ value: String(m), label: `${m}월` });
        return arr;
    }, []);

    // 지역 그룹 묶음 (그룹 뷰용)
    const grouped = useMemo(() => {
        const map = new Map();
        REGIONS.forEach(r => map.set(r.key, []));
        groupItems.forEach(f => {
            if (!map.has(f.region)) map.set(f.region, []);
            map.get(f.region).push(f);
        });
        return map;
    }, [groupItems]);

    // 페이징 계산
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const canPrev = page > 0;
    const canNext = page + 1 < totalPages;

    const goFirst = () => setPage(0);
    const goPrev = () => setPage(p => Math.max(0, p - 1));
    const goNext = () => setPage(p => (p + 1 < totalPages ? p + 1 : p));
    const goLast = () => setPage(totalPages > 0 ? totalPages - 1 : 0);

    const pageNumbers = useMemo(() => {
        if (totalPages <= 1) return [0];
        const start = Math.max(0, page - 2);
        const end = Math.min(totalPages - 1, page + 2);
        const arr = [];
        for (let i = start; i <= end; i++) arr.push(i);
        return arr;
    }, [page, totalPages]);

    // 태그 토글
    const handleTagClick = (tag) => {
        setSelectedTags((prev) => {
            const on = prev.includes(tag);
            const nextSel = on ? prev.filter(t => t !== tag) : [...prev, tag];
            // 선택 ON 되는 순간에만 최근 태그 업데이트
            if (!on) {
                setRecentTagChips((prevChips) => {
                    const next = [tag, ...prevChips.filter(x => x !== tag)].slice(0, 12);
                    localStorage.setItem("recentTagChips", JSON.stringify(next));
                    return next;
                });
            }
            return nextSel;
        });
    };

    // 그룹 → 단일 지역 점프
    const jumpToRegion = (k) => {
        setGroupView(false);
        setRegion(k);
        setPage(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // 날짜/상태 유틸
    function parseYmdOrIso(s) {
        const v = String(s || "").replaceAll("-", "");
        if (/^\d{8}$/.test(v)) {
            return new Date(Number(v.slice(0, 4)), Number(v.slice(4, 6)) - 1, Number(v.slice(6, 8)));
        }
        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? null : d;
    }

    function isOngoing(item, today = new Date()) {
        const s = parseYmdOrIso(item.startDate);
        const e = parseYmdOrIso(item.endDate || item.startDate);
        return !!(s && e && s <= today && today <= e);
    }

    function isUpcoming(item, today = new Date()) {
        const s = parseYmdOrIso(item.startDate);
        return !!(s && s > today);
    }

    function isPast(item, today = new Date()) {
        const e = parseYmdOrIso(item.endDate || item.startDate);
        return !!(e && e < today);
    }

    const clearSearchNow = () => {
        // 입력과 실제 검색어를 모두 즉시 클리어 → 결과 즉시 리셋
        setQueryDraft("");
        setQuery("");
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            // IME 조합 중 Enter는 후보 확정이므로 검색 트리거 금지
            if (isComposing) return;
            e.preventDefault();

            const v = queryDraft.trim();
            setQuery(v); // 디바운스 무시 즉시 검색

            // ✅ 최근 검색어 저장 (중복 제거, 최대 10개)
            if (v) {
                setRecentSearches((prev) => {
                    const next = [v, ...prev.filter((x) => x !== v)].slice(0, 10);
                    localStorage.setItem("recentSearches", JSON.stringify(next));
                    return next;
                });
            }
            return;
        }
        if (e.key === "Escape") {
            // ESC로 즉시 비우고 결과도 즉시 초기화
            e.preventDefault();
            clearSearchNow();
        }
    };

    // 태그 개별 삭제
    const removeRecentSearch = (value) => {
        setRecentSearches((prev) => {
            const next = prev.filter((x) => x !== value);
            if (next.length) {
                localStorage.setItem("recentSearches", JSON.stringify(next));
            } else {
                localStorage.removeItem("recentSearches");
            }
            return next;
        });
    };

    return (
        <div className="overview-wrap">
            <div className="overview-header">
                <h1>한눈에 보기</h1>
                <p className="sub">
                    지역별 축제를 빠르게 탐색하세요. (페이지네이션 / 인기·최신 / 상태·월 / 리스트·지도)
                </p>
            </div>

            {/* 툴바 */}
            <div className="toolbar">
                <div className="search">
                    <input
                        value={queryDraft}
                        onChange={(e) => {
                            setQueryDraft(e.target.value);
                        }}
                        onCompositionStart={() => { setIsComposing(true); }}
                        onCompositionEnd={(e) => {
                            setIsComposing(false);
                            // 조합 종료 문자열로 동기화 (동일값이어도 아래 useEffect가 재실행됨)
                            setQueryDraft(e.target.value);
                        }}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="축제명, 지역, 태그로 검색"
                        aria-label="축제 검색"
                    />
                    {queryDraft && (
                        <button
                            type="button"
                            className="search-clear-btn"
                            onClick={clearSearchNow}
                            aria-label="검색어 지우기"
                            title="검색어 지우기"
                            style={{ marginLeft: 8, display: queryDraft ? "inline-block" : "none" }}
                        >
                            ✕
                        </button>
                    )}
                    {/* 🔄 미니 로딩 인디케이터 (요청 중일 때만 노출) */}
                    {loading && (
                        <span className="mini-loading" role="status" aria-live="polite" aria-label="검색 중">
                            <i className="dot"></i><i className="dot"></i><i className="dot"></i>
                        </span>
                    )}
                    {/* 최근 검색어 chip */}
                    {recentSearches.length > 0 && (
                        <div className="recent-searches">
                            {recentSearches.map((s, i) => (
                                <div key={i} className="chip recent" role="group" aria-label={`최근 검색어 ${s}`}>
                                    <button
                                        type="button"
                                        className="chip-text"
                                        onClick={() => { setQueryDraft(s); setQuery(s); }}
                                        aria-label={`${s} 검색`}
                                        title={`${s} 검색`}
                                    >
                                        {s}
                                    </button>
                                    <button
                                        type="button"
                                        className="chip-x"
                                        onClick={(e) => { e.stopPropagation(); removeRecentSearch(s); }}
                                        aria-label={`최근 검색어 ${s} 삭제`}
                                        title="삭제"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                className="chip clear"
                                onClick={() => {
                                    setRecentSearches([]);
                                    localStorage.removeItem("recentSearches");
                                }}
                            >
                                전체 삭제 ✕
                            </button>
                        </div>
                    )}
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
                        <option value="default">기본</option>  {/* : 진행중(종료일↑) → 예정(시작일↑) */}
                        <option value="latest">최신순</option>
                        <option value="popular">인기순</option>
                    </select>

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

                    <select
                        className="select"
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        aria-label="월 필터"
                        title="월별"
                    >
                        {monthOptions.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                    {/* ✅ 종료 포함 토글 */}
                    <label className="toggle past-toggle" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <input
                            type="checkbox"
                            checked={includePast}
                            onChange={(e) => setIncludePast(e.target.checked)}
                        />
                        종료 포함
                    </label>
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
            {loading && (
                <div className="skeleton-grid">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div className="skeleton-card" key={i} />
                    ))}
                </div>
            )}

            {!loading && groupView && (
                <div className="group-stack">
                    {REGIONS.map(r => {
                        const list = (grouped.get(r.key) || []);
                        if (list.length === 0) return null;
                        return (
                            <section className="region-section" key={r.key} id={`section-${r.key}`}>
                                <div className="region-head">
                                    {(() => {
                                        const ongoingCount = list.filter(it => isOngoing(it)).length;
                                        const upcomingCount = list.filter(it => isUpcoming(it)).length;
                                        const pastCount = includePast ? list.filter(it => isPast(it)).length : 0;
                                        return (
                                            <h2>
                                                {r.label}
                                                <span className="count-badge" title="전체">총 {list.length}</span>
                                                <span className="count-badge ongoing" title="진행중">진행 {ongoingCount}</span>
                                                <span className="count-badge upcoming" title="예정">예정 {upcomingCount}</span>
                                                {includePast && (
                                                    <span className="count-badge past" title="종료">종료 {pastCount}</span>
                                                )}
                                            </h2>
                                        );
                                    })()}
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
                                                query={query}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>
                        );
                    })}
                    {groupItems.length === 0 && <EmptyState />}
                </div>
            )}

            {!loading && !groupView && (
                <>
                    {items.length === 0 ? (
                        <EmptyState />
                    ) : viewMode === "map" ? (
                        <MapView items={items} />
                    ) : (
                        <>
                            <div className="card-grid">
                                {items.map(f => (
                                    <RegionFestivalCard
                                        key={f.id}
                                        festival={f}
                                        onTagClick={handleTagClick}
                                        isScrapped={isScrapped}
                                        onToggleScrap={toggleScrap}
                                        query={query}
                                    />
                                ))}
                            </div>

                            {/* 페이징 바 */}
                            <nav className="pagination-bar">
                                <button className="pg-btn" disabled={!canPrev} onClick={goFirst}>{'<<'}</button>
                                <button className="pg-btn" disabled={!canPrev} onClick={goPrev}>{'<'}</button>

                                {pageNumbers[0] > 0 && <span className="pg-ellipsis">…</span>}
                                {pageNumbers.map(pn => (
                                    <button
                                        key={pn}
                                        className={`pg-num ${pn === page ? "active" : ""}`}
                                        onClick={() => setPage(pn)}
                                    >
                                        {pn + 1}
                                    </button>
                                ))}
                                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="pg-ellipsis">…</span>}

                                <button className="pg-btn" disabled={!canNext} onClick={goNext}>{'>'}</button>
                                <button className="pg-btn" disabled={!canNext} onClick={goLast}>{'>>'}</button>
                            </nav>

                            {/* 총 개수 안내 */}
                            <div className="total-hint">
                                총 {total.toLocaleString()}개 중 {(items?.length ?? 0).toLocaleString()}개 표시
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
