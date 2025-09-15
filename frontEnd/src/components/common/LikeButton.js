import React, { useState, useEffect } from "react";
import fullHeart from "../../asset/icons/full_heart.png";
import emptyHeart from "../../asset/icons/empty_heart.png";
import {
  fetchFestivalLikesCount,
  fetchFestivalLikeStatus,
  toggleFestivalLike,
} from "../../api/festivalLike";

import "./LikeButton.css";

const LikeButton = ({ festivalId, onToggleLike }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const token = localStorage.getItem("token");

  // 축제별 상태 초기화
  useEffect(() => {
    if (!festivalId) return;

    if (token) {
      // 해당 축제 좋아요 상태
      fetchFestivalLikeStatus(festivalId)
        .then((status) => setLiked(status))
        .catch((err) =>
          console.error("좋아요 상태 조회 실패:", err.response?.data || err.message)
        );

      // 해당 축제 좋아요 개수
      // fetchFestivalLikesCount(festivalId)
      //   .then((count) => setLikeCount(count))
      //   .catch((err) =>
      //     console.error("좋아요 개수 조회 실패:", err.response?.data || err.message)
      //   );
    }
  }, [festivalId, token]);

  const handleToggle = async (e) => {
    e.stopPropagation();

    if (!token) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    try {
      const { result, likeCount: updatedCount } = await toggleFestivalLike(festivalId, token);

      setLiked(result === "liked");
      setLikeCount(updatedCount);

      if (onToggleLike) {
        onToggleLike(festivalId, updatedCount);
      }
    } catch (err) {
      console.error("좋아요 토글 실패:", err.response?.data || err.message);
    }
  };



  return (
    <button className="like-button" onClick={handleToggle}>
      <img src={liked ? fullHeart : emptyHeart} alt={liked ? "좋아요" : "좋아요 안함"} />
    </button>
  );
};

export default LikeButton;
