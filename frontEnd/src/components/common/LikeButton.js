import React, { useState, useEffect } from "react";
import fullHeart from "../../asset/icons/full_heart.png";
import emptyHeart from "../../asset/icons/empty_heart.png";
import {
  fetchFestivalLikesCount,
  fetchFestivalLikeStatus,
  toggleFestivalLike,
} from "../../api/festivalLike";

const LikeButton = ({ festivalId, className }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const token = localStorage.getItem("token"); // JWT 토큰

  useEffect(() => {
    if (!festivalId) return;

    // 로그인한 경우에만 좋아요 상태 조회
    if (token) {
      fetchFestivalLikeStatus(festivalId)
        .then((liked) => setLiked(liked))
        .catch((err) =>
          console.error("좋아요 상태 조회 실패:", err.response?.data || err.message)
        );
    }
  }, [festivalId, token]);

  const handleToggle = async (e) => {
    e.stopPropagation();

    if (!token) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    try {
      const { result, likeCount: updatedCount } = await toggleFestivalLike(festivalId);
      setLiked(result === "liked");
      setLikeCount(updatedCount);
    } catch (err) {
      console.error("좋아요 토글 실패:", err.response?.data || err.message);
    }
  };

  return (
    <button
      className={className}
      onClick={handleToggle}
      style={{ border: "none", background: "transparent", cursor: "pointer" }}
    >
      <img
        src={liked ? fullHeart : emptyHeart}
        alt={liked ? "좋아요" : "좋아요 안함"}
        width={24}
        height={24}
      />
      {/* <span style={{ marginLeft: 6 }}>{likeCount}</span> */}
    </button>
  );
};

export default LikeButton;
