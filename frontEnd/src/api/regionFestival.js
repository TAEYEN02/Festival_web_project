import axios from "axios";
import { useEffect, useState, useRef } from "react";

/* =========================
   0) axios 인스턴스 & 공통 파라미터
   ========================= */
const api = axios.create({
    baseURL: "https://apis.data.go.kr/B551011/KorService2",
    timeout: 15000
});

// OS 구분 : IOS (아이폰), AND (안드로이드), WEB (웹), ETC(기타)
const MOBILE_OS = "WEB";

// 정렬구분 (A=제목순, C=수정일순, D=생성일순) 대표이미지가반드시있는정렬(O=제목순, Q=수정일순, R=생성일순)
const DEFAULT_ARRANGE = "Q";

function normalizeServiceKey(k) {
    if (!k) return "";
    try {
        if (/%[0-9A-Fa-f]{2}/.test(k)) {
            const once = decodeURIComponent(k);
            if (once !== k && /[+/=]/.test(once)) return once;
        }
    } catch (_) { }
    return k;
}

function buildCommonParams() {
    const rawKey = process.env.REACT_APP_TOURAPI_KEY || "";
    const serviceKey = normalizeServiceKey(rawKey);
    return {
        serviceKey,
        MobileOS: MOBILE_OS,
        MobileApp: "festivalGo",
        _type: "json",
        arrange: DEFAULT_ARRANGE
    };
}

/* =========================
   0-bis) 간단 LRU 캐시 (TTL 포함)
   ========================= */
class LRUCache {
    constructor(max = 100, ttlMs = 5 * 60 * 1000) {
        this.max = max;
        this.ttl = ttlMs;
        this.map = new Map(); // key -> { value, exp }
    }
    _getNow() { return Date.now(); }
    _hasFresh(entry) { return entry && entry.exp > this._getNow(); }

    get(key) {
        const entry = this.map.get(key);
        if (!this._hasFresh(entry)) {
            if (entry) this.map.delete(key);
            return undefined;
        }
        // LRU 갱신: 최근 사용으로 이동
        this.map.delete(key);
        this.map.set(key, entry);
        return entry.value;
    }
    set(key, value) {
        // 용량 넘치면 앞(가장 오래된 것)부터 제거
        while (this.map.size >= this.max) {
            const oldestKey = this.map.keys().next().value;
            this.map.delete(oldestKey);
        }
        this.map.set(key, { value, exp: this._getNow() + this.ttl });
    }
    clear() { this.map.clear(); }
}

// 전역 캐시 인스턴스 (필요 시 max/ttl 조절)
const searchFestivalCache = new LRUCache(100, 5 * 60 * 1000);

// 캐시 키 생성
function makeSearchKey({ arrange, dateRange, areaCode, pageNo, numOfRows }) {
    const start = dateRange?.eventStartDate ?? "";
    const end = dateRange?.eventEndDate ?? "";
    const code = areaCode ?? "";
    return `sf2|${arrange}|${start}-${end}|${code}|p${pageNo}|n${numOfRows}`;
}

/* =========================
   1) REGION 매핑 (공식 코드 기반)
   =========================
   1 서울, 2 인천, 3 대전, 4 대구, 5 광주, 6 부산, 7 울산, 8 세종,
   31 경기도, 32 강원특별자치도, 33 충북, 34 충남, 35 경북, 36 경남,
   37 전북특별자치도, 38 전남, 39 제주특별자치도
*/
export const REGIONS = [
    { key: "seoul", label: "서울" },
    { key: "incheon", label: "인천" },
    { key: "gyeonggi", label: "경기" },
    { key: "gangwon", label: "강원" },
    { key: "chungcheong", label: "충청" },
    { key: "jeolla", label: "전라" },
    { key: "gyeongsang", label: "경상" },
    { key: "jeju", label: "제주" }
];

const REGION_TO_AREA_CODES = {
    seoul: [1],
    incheon: [2],
    gyeonggi: [31],
    gangwon: [32],
    chungcheong: [3, 8, 33, 34],
    jeolla: [5, 37, 38],
    gyeongsang: [4, 6, 7, 35, 36],
    jeju: [39]
};

/* =========================
   2) 날짜/정렬 헬퍼
   ========================= */
function sortToArrange(sort) {
    return "Q"; // 서버는 항상 수정일(Q)로 크게 끌어오고, 클라에서 정렬
}

function parseYmdOrIso(s) {
    if (!s) return null;
    const v = String(s).replaceAll("-", "");
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

// 진행중(종료일 오름차순) → 예정(시작일 오름차순)
function sortOngoingThenUpcoming(list) {
    const today = new Date();
    const ongoing = [];
    const upcoming = [];
    for (const it of list) {
        if (isOngoing(it, today)) ongoing.push(it);
        else if (isUpcoming(it, today)) upcoming.push(it);
        // past 는 포함하지 않음(정렬용)
    }
    ongoing.sort((a, b) => {
        const ad = parseYmdOrIso(a.endDate || a.startDate || "9999-12-31");
        const bd = parseYmdOrIso(b.endDate || b.startDate || "9999-12-31");
        return (ad?.getTime() ?? Infinity) - (bd?.getTime() ?? Infinity);
    });
    upcoming.sort((a, b) => {
        const ad = parseYmdOrIso(a.startDate || "9999-12-31");
        const bd = parseYmdOrIso(b.startDate || "9999-12-31");
        return (ad?.getTime() ?? Infinity) - (bd?.getTime() ?? Infinity);
    });
    return [...ongoing, ...upcoming];
}

// 시작일 오름차순
function sortByStartDateAsc(list) {
    return [...list].sort((a, b) => {
        const ad = parseYmdOrIso(a.startDate || "9999-12-31");
        const bd = parseYmdOrIso(b.startDate || "9999-12-31");
        return (ad?.getTime() ?? Infinity) - (bd?.getTime() ?? Infinity);
    });
}

// 종료일 오름차순
function sortByEndDateAsc(list) {
    return [...list].sort((a, b) => {
        const ad = parseYmdOrIso(a.endDate || a.startDate || "9999-12-31");
        const bd = parseYmdOrIso(b.endDate || b.startDate || "9999-12-31");
        return (ad?.getTime() ?? Infinity) - (bd?.getTime() ?? Infinity);
    });
}

// 기본 정렬: 진행중→예정(요구사항)
function applyClientSort(list, sort, includePast = false) {
    const safe = Array.isArray(list) ? list.slice() : [];
    if (!sort || sort === "default" || sort === "endSoon" || sort === "startSoon") {
        // 기본: 진행중(종료일↑) → 예정(시작일↑)
        const base = sortOngoingThenUpcoming(safe);

        if (!includePast) return base;
        // ✅ past 포함 요청이면, 종료 항목을 뒤에 붙임 (최근 종료일이 먼저 오도록)
        const past = safe.filter(it => isPast(it)).sort((a, b) => {
            const ad = parseYmdOrIso(a.endDate || a.startDate || "0001-01-01");
            const bd = parseYmdOrIso(b.endDate || b.startDate || "0001-01-01");
            return (bd?.getTime() ?? -Infinity) - (ad?.getTime() ?? -Infinity); // 최근에 끝난 순
        });

        return [...base, ...past];
    }
    if (sort === "latest" || sort === "popular") {
        // 인기 지표 부재 → 수정일 내림차순으로 대체
        return safe.sort((a, b) => (b.modified || "").localeCompare(a.modified || ""));
    }
    return sortOngoingThenUpcoming(safe);
}

function currentYearRangeYYYYMMDD() {
    const now = new Date();
    const y = now.getFullYear();
    return { start: `${y}0101`, end: `${y}1231` };
}

function buildDateRangeByStatus(status) {
    const { start, end } = currentYearRangeYYYYMMDD();
    if (!status || status === "all") return { eventStartDate: start, eventEndDate: end };

    const today = new Date();
    const y = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const ymd = `${y}${mm}${dd}`;

    if (status === "upcoming") return { eventStartDate: ymd, eventEndDate: end };
    if (status === "past") return { eventStartDate: start, eventEndDate: ymd };
    // ongoing은 서버 파라미터가 없으므로 전체 기간 후 클라 보정
    return { eventStartDate: start, eventEndDate: end };
}

function buildDateRangeByMonth(month) {
    if (!month || month === "all") return null;
    const m = Number(month);
    if (Number.isNaN(m) || m < 1 || m > 12) return null;
    const lastDay = new Date(new Date().getFullYear(), m, 0).getDate();
    const mm = String(m).padStart(2, "0");
    return {
        eventStartDate: `${new Date().getFullYear()}${mm}01`,
        eventEndDate: `${new Date().getFullYear()}${mm}${String(lastDay).padStart(2, "0")}`
    };
}

/* =========================
   3) API 호출 유틸(단일 areaCode)
   ========================= */
async function callSearchFestival({ arrange, dateRange, areaCode, numOfRows = 1000, pageNo = 1, signal }) {
    const key = makeSearchKey({ arrange, dateRange, areaCode, pageNo, numOfRows });
    const hit = searchFestivalCache.get(key);
    if (hit) {
        return { items: hit }; // ✅ 캐시 히트 시 즉시 반환
    }

    const params = {
        ...buildCommonParams(),
        arrange,
        ...dateRange,
        pageNo,
        numOfRows,
        ...(areaCode ? { areaCode } : {})
    };
    const res = await api.get("/searchFestival2", { params, signal });
    console.log("res :::", res);
    const items = pickArraySafely(res.data);

    // ✅ 캐싱
    searchFestivalCache.set(key, items);
    return { items };
}

/* =========================
   4) 응답 → 화면 스키마 매핑
   ========================= */
function normalizeItem(raw) {
    const id = String(raw.contentid ?? raw.id ?? "");
    const name = String(raw.title ?? raw.name ?? "제목 미상");
    const address = String(raw.addr1 ?? raw.address ?? "");
    const startDate = toDateStr(raw.eventstartdate ?? raw.startDate);
    const endDate = toDateStr(raw.eventenddate ?? raw.endDate);
    const imageUrl = raw.firstimage || raw.firstimage2 || raw.imageUrl || null;
    const lat = parseFloat(raw.mapy ?? raw.lat ?? NaN);
    const lng = parseFloat(raw.mapx ?? raw.lng ?? NaN);

    return {
        id,
        name,
        region: mapAreaCodeToRegion(raw.areacode, address),
        address,
        startDate,
        endDate,
        imageUrl,
        tags: [],
        popularity: 0,
        ticketUrl: "",
        lat: Number.isNaN(lat) ? undefined : lat,
        lng: Number.isNaN(lng) ? undefined : lng,
        description: "",
        tel: raw.tel || "",
        modified: toDateTimeStr(raw.modifiedtime)
    };
}

function toDateStr(v) {
    if (!v) return "";
    const s = String(v);
    if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }
    return "";
}

function toDateTimeStr(v) {
    if (!v) return "";
    const s = String(v);
    if (/^\d{14}$/.test(s)) {
        return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)} ${s.slice(8, 10)}:${s.slice(10, 12)}:${s.slice(12, 14)}`;
    }
    return "";
}

function mapAreaCodeToRegion(areaCode, address = "") {
    const code = Number(areaCode);
    if (REGION_TO_AREA_CODES.seoul.includes(code)) return "seoul";
    if (REGION_TO_AREA_CODES.incheon.includes(code)) return "incheon";
    if (REGION_TO_AREA_CODES.gyeonggi.includes(code)) return "gyeonggi";
    if (REGION_TO_AREA_CODES.gangwon.includes(code)) return "gangwon";
    if (REGION_TO_AREA_CODES.chungcheong.includes(code)) return "chungcheong";
    if (REGION_TO_AREA_CODES.jeolla.includes(code)) return "jeolla";
    if (REGION_TO_AREA_CODES.gyeongsang.includes(code)) return "gyeongsang";
    if (REGION_TO_AREA_CODES.jeju.includes(code)) return "jeju";
}

/* =========================
   5) 공통 후처리(상태/지역/태그)
   ========================= */
// 기본(all): 진행중 + 예정만 (종료 제외)
function refineByStatusClientSide(list, status, includePast = false) {
    const today = new Date();

    if (!status || status === "all") {
        if (includePast) return list; // ✅ 요청 시 past도 포함
        return list.filter(it => isOngoing(it, today) || isUpcoming(it, today));
    }
    if (status === "ongoing") {
        return list.filter(it => isOngoing(it, today));
    }
    if (status === "upcoming") {
        return list.filter(it => isUpcoming(it, today));
    }
    if (status === "past") {
        return list.filter(it => isPast(it, today));
    }
    return list;
}

function applyRegionFilter(list, region) {
    if (!region || region === "all") return list;
    return list.filter(f => f.region === region);
}

function applyTagsFilter(list, tags = []) {
    if (!tags || tags.length === 0) return list;
    return list.filter(f => {
        const ft = (f.tags || []).map(String);
        return tags.every(t => ft.includes(t));
    });
}

// 간단 텍스트 필터
function applyQueryFilter(list, q = "") {
    const keyword = String(q || "").trim().toLowerCase();
    if (!keyword) return list;

    return list.filter(f => {
        const pool = [
            f.name,
            f.address,
            f.region,
            ...(Array.isArray(f.tags) ? f.tags : [])
        ].map(v => String(v || "").toLowerCase());

        return pool.some(v => v.includes(keyword));
    });
}

/* =========================
   6) 목록(그룹뷰) - 페이지네이션 아님
   ========================= */
export async function fetchFestivals({
    query = "",
    region = "all",
    sort = "endSoon",
    status = "all",
    month = "all",
    tags = [],
    signal,
    includePast = false
} = {}) {
    const arrange = sortToArrange(sort);
    const dateRange = buildDateRangeByMonth(month) || buildDateRangeByStatus(status);

    // region === "all" 이면 areaCode 없이 1회 호출
    let results;
    if (region === "all") {
        results = await Promise.all([
            callSearchFestival({ arrange, dateRange, numOfRows: 1000, pageNo: 1, signal })
        ]);
    } else {
        const codes = REGION_TO_AREA_CODES[region] || [];
        results = await Promise.all(
            codes.map(code =>
                callSearchFestival({ arrange, dateRange, areaCode: code, numOfRows: 1000, pageNo: 1, signal })
            )
        );
    }

    const merged = results.flatMap(r => r.items).map(normalizeItem);

    let list = refineByStatusClientSide(merged, status, includePast);
    list = applyRegionFilter(list, region);
    list = applyTagsFilter(list, tags);

    list = applyQueryFilter(list, query); 

    // 기본: 진행중(종료일↑) → 예정(시작일↑)
    list = applyClientSort(list, sort, includePast);

    return list;
}

/* =========================
   7) 페이지네이션(단일뷰)
   ========================= */
export async function fetchFestivalsPage({
    query = "",
    region = "all",
    sort = "endSoon",
    status = "all",
    month = "all",
    tags = [],
    page = 0,
    size = 20,
    signal,
    includePast = false,
} = {}) {
    const arrange = sortToArrange(sort);
    const dateRange = buildDateRangeByMonth(month) || buildDateRangeByStatus(status);

    // region === "all" 이면 areaCode 없이 1회 호출
    let results;
    if (region === "all") {
        results = await Promise.all([
            callSearchFestival({ arrange, dateRange, numOfRows: 1000, pageNo: 1, signal })
        ]);
    } else {
        const codes = REGION_TO_AREA_CODES[region] || [];
        results = await Promise.all(
            codes.map(code =>
                callSearchFestival({ arrange, dateRange, areaCode: code, numOfRows: 1000, pageNo: 1, signal })
            )
        );
    }

    const merged = results.flatMap(r => r.items).map(normalizeItem);

    let filtered = refineByStatusClientSide(merged, status, includePast);
    filtered = applyRegionFilter(filtered, region);
    filtered = applyTagsFilter(filtered, tags);

    filtered = applyQueryFilter(filtered, query); 

    // 기본: 진행중(종료일↑) → 예정(시작일↑)
    filtered = applyClientSort(filtered, sort, includePast);

    const total = filtered.length;
    const start = page * size;
    const items = filtered.slice(start, start + size);
    const hasNext = start + items.length < total;

    return { items, page, size, total, hasNext };
}

/* =========================
   8) 상세 조회
   ========================= */
export async function fetchFestivalById(id) {
    const params = {
        ...buildCommonParams(),
        contentId: id,
        defaultYN: "Y",
        overviewYN: "Y",
        addrinfoYN: "Y",
        mapinfoYN: "Y",
        imageYN: "N"
    };
    const res = await api.get("/detailCommon2", { params });
    const item = pickOneSafely(res.data);
    return item ? normalizeItem(item) : null;
}

/* =========================
   9) 연관 축제
   ========================= */
export async function fetchRelatedFestivals({ region, excludeId, limit = 8 } = {}) {
    const pool = await fetchFestivals({ region, status: "all" });
    return pool.filter(f => f.id !== excludeId).slice(0, limit);
}

/* =========================
   10) 응답 파서/유틸
   ========================= */
function pickArraySafely(data) {
    try {
        const item = data?.response?.body?.items?.item ?? [];
        return Array.isArray(item) ? item : [item].filter(Boolean);
    } catch {
        return [];
    }
}
function pickOneSafely(data) {
    const arr = pickArraySafely(data);
    return arr[0] ?? null;
}

export function __clearFestivalCache() {
    searchFestivalCache.clear();
}
