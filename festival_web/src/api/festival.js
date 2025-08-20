import axios from "axios";

const API_BASE = "http://localhost:8080/festivals"; // 백엔드 URL

// 디코딩된 인증키
const API_KEY = "2piBNpWzKFccWKcWevKpU314EjNULmxCbZNcuzfUEmPtoKQyO5J+j0J3qI0qWQVWuHCQWxtmYbCwp2OdOl8+xg=="; 

export const fetchFestivalsFromApi = async () => {
  try {
    const response = await axios.get(
      `https://apis.data.go.kr/B551011/KorService2/searchFestival2`,
      {
        params: {
          serviceKey: API_KEY,
          numOfRows: 100, // 넉넉히 가져오기
          pageNo: 1,
          MobileOS: "ETC",
          MobileApp: "AppTest",
          _type: "json",
          eventStartDate: new Date().toISOString().slice(0,10).replace(/-/g, ""), // 오늘 기준 이후 축제
          eventEndDate: "20251231", // 연말까지
        },
      }
    );

    if (!response.data.response?.body?.items?.item) {
      console.error("API 응답에 축제 없음:", response.data);
      return [];
    }

    let items = response.data.response.body.items.item;

    // 시작일 기준 오름차순 정렬 → 최신 축제
    items.sort((a, b) => {
      return a.eventstartdate.localeCompare(b.eventstartdate);
    });

    // 앞에서 10개만 가져오기
    return items.slice(0, 10);
  } catch (error) {
    console.error("축제 정보 불러오기 실패:", error);
    return [];
  }
};


// // Tour API에서 바로 최신/인기 축제 가져오기 (DB 사용 안 함)
// export const fetchFestivalsFromApi = async () => {
//   try {
//     const response = await axios.get(`${API_BASE}/from-api`);
//     return response.data || [];
//   } catch (error) {
//     console.error("Tour API 축제 조회 실패:", error);
//     return [];
//   }
// };

// // DB에서 최신순/인기순 조회 (원하면 사용 가능)
// export const fetchFestivalsFromDB = async (sort = "latest") => {
//   try {
//     const response = await axios.get(`${API_BASE}`, { params: { sort } });
//     return response.data || [];
//   } catch (error) {
//     console.error("DB 축제 조회 실패:", error);
//     return [];
//   }
// };

// 축제 상세정보 가져오기
export const fetchFestivalDetail = async (contentId) => {
  try {
    const res = await axios.get(`${API_BASE}/detail/${contentId}`);
    return res.data.response.body.items.item;
  } catch (err) {
    console.error("축제 상세 조회 실패:", err);
    return null;
  }
};

// 상세 조회 + 클릭 시 DB 저장
// export const fetchFestivalDetailAndSave = async (externalId) => {
//   try {
//     const response = await axios.get(`${API_BASE}/${externalId}`);
//     return response.data;
//   } catch (error) {
//     console.error("상세 조회 실패:", error);
//     return null;
//   }
// };

// // 예매 클릭 기록 + URL 반환
// export const clickBooking = async (id) => {
//   try {
//     const response = await axios.post(`${API_BASE}/${id}/click`);
//     return response.data;
//   } catch (error) {
//     console.error("예매 클릭 기록 실패:", error);
//     return null;
//   }
// };

// // 키워드로 축제 검색
// export const searchFestivals = async (keyword) => {
//   try {
//     const res = await axios.get(`${API_BASE}/search`, {
//       params: { keyword },
//     });
//     return res.data;
//   } catch (error) {
//     console.error(`Failed to search festivals (keyword: ${keyword})`, error);
//     return [];
//   }
// };
