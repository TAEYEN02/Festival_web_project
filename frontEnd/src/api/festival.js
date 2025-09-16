import axios from "axios";


const API_BASE = "http://localhost:8081/api/festivals"; // 백엔드 URL

// 디코딩된 인증키
const API_KEY = "437d76c0cc52c6e459d60d55ba21fa2b4446b310df80d1a0f2e8ff57f2ed8222"; 

export const fetchFestivalsFromApi = async () => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10).replace(/-/g, "");

    const response = await axios.get(
      `https://apis.data.go.kr/B551011/KorService2/searchFestival2`,
      {
        params: {
          serviceKey: API_KEY,
          numOfRows: 200, // 넉넉히
          pageNo: 1,
          MobileOS: "ETC",
          MobileApp: "AppTest",
          _type: "json",
          eventStartDate: todayStr,
          eventEndDate: "20251231",
        },
      }
    );

    if (!response.data.response?.body?.items?.item) {
      console.error("API 응답에 축제 없음:", response.data);
      return [];
    }

    let items = response.data.response.body.items.item;

    // 오늘 날짜와 겹치는 "여름 축제(6~8월)" 필터링
    const summerFestivals = items.filter((festival) => {
      const start = festival.eventstartdate;
      const end = festival.eventenddate;
      const month = parseInt(start.substring(4, 6)); // 시작일 기준 월
      return (
        month >= 6 &&
        month <= 8 &&
        todayStr >= start &&
        todayStr <= end
      );
    });

    // 랜덤 섞기
    const shuffled = summerFestivals.sort(() => Math.random() - 0.5);

    // 앞에서 10개만 랜덤 선택
    return shuffled.slice(0, 10);
  } catch (error) {
    console.error("축제 정보 불러오기 실패:", error);
    return [];
  }
};


// 축제 데이터 가져오기 (import)
export const importFestivals = async (token) => {
  try {
    const response = await axios.post(
      "/api/festivals/import",
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("축제 데이터 가져오기 실패:", error);
    throw error;
  }
};

// DB에 있는 모든 축제 데이터 삭제 (delete)
export const deleteFestivals = async (token) => {
  try {
    const response = await axios.delete("/api/festivals/delete", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("축제 데이터 삭제 실패:", error);
    throw error;
  }
};

// DB 초기화 후 최신 데이터 가져오기 (delete 후 import)
export const resetAndImportFestivals = async (token) => {
  try {
    const response = await axios.post("/api/festivals/reset-and-import", {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("DB 초기화 + 데이터 가져오기 실패:", error);
    throw error;
  }
};


// 축제 최신순
export const fetchLatestFestivals = async () => {
  try {
    const res = await axios.get(`${API_BASE}/latest`);

    console.log(res.data)
    
    const raw = Array.isArray(res.data) ? res.data : [];

    return raw.map(f => ({
      contentid: String(f.contentId ?? f.id ?? ""),
      title: f.name ?? "제목 없음",
      addr1: f.location ?? "",
      eventstartdate: f.startDate ? f.startDate.replace(/-/g, "") : "",
      eventenddate: f.endDate ? f.endDate.replace(/-/g, "") : "",
      firstimage: f.firstimage ?? "/default.jpg",
      likes: f.likesCount ?? 0,  
      views: f.views ?? 0,
    }));
  } catch (err) {
    console.error("최신순 축제 불러오기 실패:", err);
    return [];
  }
};



// 축제 인기순 (좋아요 수 기준)
export const fetchPopularFestivalsByLikes = async () => {
  try {
    const response = await axios.get(`${API_BASE}/likes`);
    let data = response.data;

    // 좋아요 0 제외
    let filtered = data.filter(f => f.likes > 0);

    // 모두 0이면 랜덤 10개
    if (filtered.length === 0) {
      filtered = data.sort(() => 0.5 - Math.random()).slice(0, 10);
    }

   return filtered.map(f => ({
    contentid: String(f.contentId ?? f.id ?? ""),
    title: f.name ?? "제목 없음",
    addr1: f.location ?? "",
    eventstartdate: f.startDate ? f.startDate.replace(/-/g, "") : "",
    eventenddate: f.endDate ? f.endDate.replace(/-/g, "") : "",
    firstimage: f.firstimage || "/default.jpg",
    likes: f.likesCount ?? 0,
    views: f.views ?? 0,
    clicks: f.clicks ?? 0,
  }));
  } catch (error) {
    console.error("좋아요순 축제 불러오기 실패:", error);
    return [];
  }
};




// 축제 인기순 (조회수 수 기준)
export const fetchPopularFestivalsByViews = async () => {
  try {
    const response = await axios.get(`${API_BASE}/popular`);
    const sorted = response.data
      .sort((a, b) => b.views - a.views) // 조회수 내림차순
      .slice(0, 10);

    return sorted.map(f => ({
      contentid: f.contentId,
      title: f.name,
      addr1: f.location,
      eventstartdate: f.startDate.replace(/-/g, ""),
      eventenddate: f.endDate.replace(/-/g, ""),
      firstimage: f.firstimage || "/default.jpg",
      likes: f.likesCount ?? 0,
      views: f.views,
      clicks: f.clicks,
    }));
  } catch (error) {
    console.error("조회수순 축제 불러오기 실패:", error);
    return [];
  }
};

// 조회수 증가
export const incrementViews = async (contentId) => {
  try {
    await axios.post(`/api/festivals/increment-views/${contentId}`);
  } catch (error) {
    console.error("조회수 증가 실패:", error);
    throw error;
  }
};


// 축제 검색 API
export const searchFestivals = async (query) => {
  if(!query || !query.trim()) return []; // 🔹 빈 검색어 안전 처리
  try {
    const res = await axios.get(`${API_BASE}/search`, {
      params: { query }
    });
    return res.data; // 검색 결과 배열 반환
  } catch (err) {
    console.error("축제 검색 오류:", err);
    return [];
  }
};

// 전체 축제 가져오기
export const fetchAllFestivals = async () => {
  try {
    const res = await axios.get(`${API_BASE}/festivals`);
    return res.data;
  } catch (err) {
    console.error("전체 축제 조회 오류:", err);
    return [];
  }
};
