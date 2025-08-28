// src/api/festivalLikes.js
import axios from "axios";
const API_BASE = "/api/festivals";

// 좋아요 토글
export const toggleFestivalLike = async (festivalId, token) => {
  const response = await axios.post(
    `${API_BASE}/${festivalId}/like`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data; // { liked: boolean, likeCount: number }
};

// 좋아요 상태 + 개수 조회
export const getFestivalLikeStatus = async (festivalId, token) => {
  const response = await axios.get(`${API_BASE}/${festivalId}/like-status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data; // { liked: boolean, likeCount: number }
};