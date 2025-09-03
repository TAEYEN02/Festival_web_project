import axios from "axios";

const BASE_URL = "http://localhost:8081/api/festivals";

// 축제 좋아요 여부 조회 (로그인 필요)
export const fetchFestivalLikeStatus = async (festivalId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false; // 로그인 안 된 경우 false 반환

    const res = await axios.get(`${BASE_URL}/${festivalId}/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.liked;
  } catch (err) {
    console.error(
      "좋아요 상태 조회 실패",
      err.response?.data || err.message
    );
    return false; // 인증 안됐거나 오류 발생 시 false 반환
  }
};

// 축제 좋아요 토글
export const toggleFestivalLike = async (festivalId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("로그인이 필요합니다.");

    const res = await axios.post(
      `${BASE_URL}/${festivalId}`,
      null, // POST body 없음
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return {
      result: res.data.result, // "liked" / "unliked"
      likeCount: res.data.likeCount,
    };
  } catch (err) {
    console.error(
      "좋아요 토글 실패",
      err.response?.data || err.message
    );
    throw err;
  }
};


//축제 좋아요 수 조회 (로그인 필요 없음)
export const fetchFestivalLikesCount = async (festivalId) => {
  try {
    const res = await axios.get(`${BASE_URL}/${festivalId}/count`);
    return res.data.likeCount || res.data; // 서버 응답에 따라 조정
  } catch (err) {
    console.error("좋아요 개수 조회 실패", err);
    throw err;
  }
};
