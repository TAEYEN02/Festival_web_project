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



// 축제 상세정보 가져오기
export const fetchFestivalDetail = async (id) => {
  try {
    const res = await axios.get(`${API_BASE}/detail/${id}`);
    return res.data; // 축제 상세 정보
  } catch (err) {
    console.error("축제 상세 조회 실패:", err);
    return null;
  }
};

// 축제 최신순
export const fetchLatestFestivals = async () => {
  try {
    const response = await axios.get(`${API_BASE}/latest`);
    const today = new Date();

    // 오늘 이후 시작하는 축제만 필터
    const upcoming = response.data
      .filter(f => new Date(f.startDate) >= today)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)) // 시작일 기준 오름차순
      .slice(0, 10); // 최신 10개

    const formatted = upcoming.map(f => ({
      contentid: f.contentId,
      title: f.name,
      addr1: f.location,
      eventstartdate: f.startDate.replace(/-/g, ""),
      eventenddate: f.endDate.replace(/-/g, ""),
      firstimage: f.firstimage,
      likes: f.likes,
      views: f.views,
      clicks: f.clicks,
    }));

    return formatted;
  } catch (error) {
    console.error("최신순 축제 불러오기 실패:", error);
    return [];
  }
};


// 축제 인기순 (좋아요 수 기준)
export const fetchPopularFestivalsByLikes = async () => {
  try {
    const response = await axios.get(`${API_BASE}/popular`);
    const sorted = response.data
      .sort((a, b) => b.likes - a.likes) // 좋아요 내림차순
      .slice(0, 10);

    return sorted.map(f => ({
      contentid: f.contentId,
      title: f.name,
      addr1: f.location,
      eventstartdate: f.startDate.replace(/-/g, ""),
      eventenddate: f.endDate.replace(/-/g, ""),
      firstimage: f.firstimage,
      likes: f.likes,
      views: f.views,
      clicks: f.clicks,
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
      firstimage: f.firstimage,
      likes: f.likes,
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

// 좋아요 토글
export const toggleFestivalLike = async (contentId) => {
  try {
    const response = await axios.post(`${API_BASE}/toggle-like/${contentId}`);
    return response.data.likes; // 현재 좋아요 수 반환
  } catch (err) {
    console.error("좋아요 토글 실패:", err);
    return null;
  }
};

