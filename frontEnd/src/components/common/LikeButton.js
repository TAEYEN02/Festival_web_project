import { useEffect, useState } from "react";
import { toggleFestivalLike, getFestivalLikeStatus } from "../../api/festivalLike";

// src/assets/icons에 있는 이미지 사용
import fullHeart from "../../asset/icons/full_heart.png";
import emptyHeart from "../../asset/icons/empty_heart.png";

const LikeButton = ({ festivalId, token, className }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // 초기 상태 조회
  useEffect(() => {
    if (!token) return;
    getFestivalLikeStatus(festivalId, token).then(data => {
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    });
  }, [festivalId, token]);

  const handleToggle = async (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    if (!token) return alert("로그인이 필요합니다.");

    try {
      const data = await toggleFestivalLike(festivalId, token);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (err) {
      console.error("좋아요 토글 실패", err);
    }
  };

  return (
    <button className={className} onClick={handleToggle}>
      <img
        src={liked ? fullHeart : emptyHeart}
        alt={liked ? "좋아요" : "좋아요 안함"}
        style={{ width: "24px", height: "24px" }}
      />
      
      {/* <span>{likeCount}</span> */}
    </button>
  );
};

export default LikeButton;
