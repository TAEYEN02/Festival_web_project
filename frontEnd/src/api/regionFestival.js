import { isOngoing, isUpcoming, isPast, toMonthKey } from "../util/date.js";

const USE_MOCK = true;

export const REGIONS = [
    { key: "seoul", label: "서울" },
    { key: "gg", label: "경기/인천" },
    { key: "gangwon", label: "강원" },
    { key: "chungcheong", label: "충청" },
    { key: "jeolla", label: "전라" },
    { key: "gyeongsang", label: "경상" },
    { key: "jeju", label: "제주" }
];

const MOCK = [
    {
        id: "f001",
        name: "서울 불꽃 축제",
        region: "seoul",
        address: "서울시 영등포구 여의도동",
        startDate: "2025-10-05",
        endDate: "2025-10-05",
        imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=1200&auto=format&fit=crop",
        tags: ["불꽃놀이", "야간", "포토스팟"],
        popularity: 9876,
        ticketUrl: "https://tickets.yes24.com/",
        lat: 37.526, lng: 126.933,
        description: "한강을 수놓는 초대형 불꽃 쇼. 여의도 일대에서 펼쳐지는 대표 야간 축제입니다."
    },
    {
        id: "f002",
        name: "인천 펜타포트 락페",
        region: "gg",
        address: "인천광역시 연수구",
        startDate: "2025-08-22",
        endDate: "2025-08-24",
        imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop",
        tags: ["락", "야외", "공연"],
        popularity: 8534,
        ticketUrl: "https://tickets.yes24.com/",
        lat: 37.389, lng: 126.639,
        description: "국내 최대급 록 페스티벌. 다양한 라인업과 캠핑존이 특징."
    },
    {
        id: "f003",
        name: "춘천 마임 축제",
        region: "gangwon",
        address: "강원특별자치도 춘천시",
        startDate: "2025-05-25",
        endDate: "2025-06-01",
        imageUrl: "https://images.unsplash.com/photo-1603190287605-e7deaecc0a5e?q=80&w=1200&auto=format&fit=crop",
        tags: ["마임", "퍼포먼스", "거리예술"],
        popularity: 4321,
        ticketUrl: "https://tickets.yes24.com/",
        lat: 37.881, lng: 127.73,
        description: "국내 최대 거리 마임 페스티벌. 도심 곳곳이 무대로 변하는 일주일."
    },
    {
        id: "f004",
        name: "보령 머드 축제",
        region: "chungcheong",
        address: "충남 보령 대천해수욕장",
        startDate: "2025-07-19",
        endDate: "2025-07-28",
        imageUrl: "https://images.unsplash.com/photo-1594787318289-4ec1952b16cc?q=80&w=1200&auto=format&fit=crop",
        tags: ["해변", "엑티비티", "여름"],
        popularity: 7765,
        ticketUrl: "https://tickets.yes24.com/",
        lat: 36.321, lng: 126.511,
        description: "온몸으로 즐기는 머드 체험. 외국인에게도 인기 높은 여름 축제."
    },
    {
        id: "f005",
        name: "전주 국제 영화제",
        region: "jeolla",
        address: "전북특별자치도 전주시",
        startDate: "2025-05-01",
        endDate: "2025-05-10",
        imageUrl: "https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=1200&auto=format&fit=crop",
        tags: ["영화", "국제", "아트"],
        popularity: 6890,
        ticketUrl: "https://tickets.yes24.com/",
        lat: 35.824, lng: 127.148,
        description: "독립·예술영화 중심 국제 영화제. 다양한 섹션과 GV 진행."
    },
    {
        id: "f006",
        name: "진주 남강 유등 축제",
        region: "gyeongsang",
        address: "경남 진주시",
        startDate: "2025-10-01",
        endDate: "2025-10-14",
        imageUrl: "https://images.unsplash.com/photo-1516542076529-1ea3854896e1?q=80&w=1200&auto=format&fit=crop",
        tags: ["등불", "야간", "전통"],
        popularity: 7123,
        ticketUrl: "https://tickets.yes24.com/",
        lat: 35.18, lng: 128.108,
        description: "남강을 따라 이어지는 화려한 등불의 향연."
    },
    {
        id: "f007",
        name: "제주 감귤 축제",
        region: "jeju",
        address: "제주특별자치도 서귀포시",
        startDate: "2025-11-10",
        endDate: "2025-11-20",
        imageUrl: "https://images.unsplash.com/photo-1605166744051-b5f4f8e0320f?q=80&w=1200&auto=format&fit=crop",
        tags: ["농산물", "체험", "가족"],
        popularity: 3456,
        ticketUrl: "https://tickets.yes24.com/",
        lat: 33.254, lng: 126.56,
        description: "제주 감귤 수확 체험과 지역 특산물 마켓."
    },
    {
        id: "f008",
        name: "수원 화성 문화제",
        region: "gg",
        address: "경기도 수원시 팔달구",
        startDate: "2025-10-03",
        endDate: "2025-10-06",
        imageUrl: "https://images.unsplash.com/photo-1605969227590-2b84bba6c3d1?q=80&w=1200&auto=format&fit=crop",
        tags: ["전통", "퍼레이드", "불꽃"],
        popularity: 5012,
        ticketUrl: "https://tickets.yes24.com/",
        lat: 37.286, lng: 127.013,
        description: "정조대왕 능행차 재현 등 전통 퍼포먼스가 가득."
    },
    {
        id: "f009",
        name: "통영 국제 음악제",
        region: "gyeongsang",
        address: "경남 통영시",
        startDate: "2025-03-28",
        endDate: "2025-04-06",
        imageUrl: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop",
        tags: ["클래식", "공연", "국제"],
        popularity: 3890,
        ticketUrl: "https://tickets.yes24.com/",
        lat: 34.854, lng: 128.433,
        description: "세계 정상급 연주자들이 찾는 클래식 축제."
    },
    {
        id: "f010",
        name: "부산 불꽃 축제",
        region: "gyeongsang",
        address: "부산광역시 광안리해변",
        startDate: "2025-11-02",
        endDate: "2025-11-02",
        imageUrl: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1200&auto=format&fit=crop",
        tags: ["불꽃놀이", "바다", "야간"],
        popularity: 9650,
        ticketUrl: "https://tickets.yes24.com/",
        lat: 35.153, lng: 129.118,
        description: "광안대교를 배경으로 펼쳐지는 초대형 불꽃 쇼."
    },
    {
        id: "f011",
        name: "강릉 커피 축제",
        region: "gangwon",
        address: "강원특별자치도 강릉시",
        startDate: "2025-10-05",
        endDate: "2025-10-08",
        imageUrl: "https://images.unsplash.com/photo-1507133750040-4a8f57021519?q=80&w=1200&auto=format&fit=crop",
        tags: ["커피", "전시", "마켓"],
        popularity: 6120,
        ticketUrl: "https://tickets.yes24.com/",
        lat: 37.751, lng: 128.876,
        description: "커피 도시 강릉을 즐기는 전시·마켓·시음 행사."
    },
    {
        id: "f012",
        name: "광주 비엔날레",
        region: "jeolla",
        address: "광주광역시 북구",
        startDate: "2025-09-06",
        endDate: "2025-11-30",
        imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1200&auto=format&fit=crop",
        tags: ["미술", "전시", "국제"],
        popularity: 7011,
        ticketUrl: "https://tickets.yes24.com/",
        lat: 35.159, lng: 126.852,
        description: "현대미술의 흐름을 만나는 국제 전시 행사."
    }
];

/**
 * (그룹/요약용) 전체 목록 조회 - 필터는 서버 파라미터에 맞춤
 * 서버 전환 시: GET /api/festivals?q=&region=&sort=&status=&month=&tags=
 */
export async function fetchFestivals({
    query = "",
    region = "all",
    sort = "popular",
    status = "all",
    month = "all",
    tags = []
} = {}) {
    if (USE_MOCK) {
        await delay(150);
        let data = [...MOCK];

        // region
        if (region !== "all") {
            data = data.filter(f => f.region === region);
        }
        // query
        if (query.trim()) {
            const q = query.trim().toLowerCase();
            data = data.filter(f =>
                f.name.toLowerCase().includes(q) ||
                (f.address && f.address.toLowerCase().includes(q)) ||
                (f.tags || []).some(t => String(t).toLowerCase().includes(q))
            );
        }
        // status
        if (status !== "all") {
            data = data.filter(f => {
                if (status === "ongoing") return isOngoing(f.startDate, f.endDate);
                if (status === "upcoming") return isUpcoming(f.startDate);
                if (status === "past") return isPast(f.endDate ?? f.startDate);
                return true;
            });
        }
        // month
        if (month !== "all") {
            data = data.filter(f => toMonthKey(f.startDate) === month);
        }
        // tags (모두 포함)
        if (tags && tags.length > 0) {
            data = data.filter(f => {
                const ft = (f.tags || []).map(String);
                return tags.every(t => ft.includes(t));
            });
        }
        // sort
        data.sort((a, b) => {
            if (sort === "latest") {
                return new Date(b.startDate) - new Date(a.startDate);
            }
            return (b.popularity || 0) - (a.popularity || 0);
        });

        return data;
    } else {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (region && region !== "all") params.set("region", region);
        if (sort) params.set("sort", sort);
        if (status && status !== "all") params.set("status", status);
        if (month && month !== "all") params.set("month", month);
        if (tags && tags.length) params.set("tags", tags.join(","));
        const res = await fetch(`/api/festivals?${params.toString()}`, { method: "GET" });
        if (!res.ok) throw new Error("축제 데이터를 불러오지 못했습니다.");
        return await res.json();
    }
}

/**
 * (리스트/무한스크롤용) 페이지 조회
 * 서버 전환 시: GET /api/festivals?page=0&size=20&q=&region=&sort=&status=&month=&tags=
 * 반환 형태: { items, page, size, total, hasNext }
 */
export async function fetchFestivalsPage({
    query = "",
    region = "all",
    sort = "popular",
    status = "all",
    month = "all",
    tags = [],
    page = 0,
    size = 20
} = {}) {
    if (USE_MOCK) {
        // 모의: 필터/정렬 → 슬라이스(페이지) → total/hasNext 계산
        const all = await fetchFestivals({ query, region, sort, status, month, tags });
        const start = page * size;
        const items = all.slice(start, start + size);
        const total = all.length;
        const hasNext = start + items.length < total;
        await delay(120);
        return { items, page, size, total, hasNext };
    } else {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("size", String(size));
        if (query) params.set("q", query);
        if (region && region !== "all") params.set("region", region);
        if (sort) params.set("sort", sort);
        if (status && status !== "all") params.set("status", status);
        if (month && month !== "all") params.set("month", month);
        if (tags && tags.length) params.set("tags", tags.join(","));
        const res = await fetch(`/api/festivals?${params.toString()}`, { method: "GET" });
        if (!res.ok) throw new Error("축제 페이지를 불러오지 못했습니다.");
        return await res.json(); // 서버도 동일 구조 반환 권장
    }
}

/* 상세 */
export async function fetchFestivalById(id) {
    if (USE_MOCK) {
        await delay(150);
        return MOCK.find(f => f.id === id) || null;
    } else {
        const res = await fetch(`/api/festivals/${encodeURIComponent(id)}`, { method: "GET" });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("축제 상세를 불러오지 못했습니다.");
        return await res.json();
    }
}

/* 연관 */
export async function fetchRelatedFestivals({ region, excludeId, limit = 8 } = {}) {
    if (USE_MOCK) {
        await delay(120);
        return MOCK.filter(f => f.region === region && f.id !== excludeId).slice(0, limit);
    } else {
        const params = new URLSearchParams();
        if (region) params.set("region", region);
        if (excludeId) params.set("exclude", excludeId);
        params.set("limit", String(limit));
        const res = await fetch(`/api/festivals/related?${params.toString()}`, { method: "GET" });
        if (!res.ok) throw new Error("연관 축제를 불러오지 못했습니다.");
        return await res.json();
    }
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
