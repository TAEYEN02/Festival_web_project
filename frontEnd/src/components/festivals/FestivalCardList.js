import Slider from "react-slick";
import FestivalCard from "./FestivalCard";
import { useEffect } from "react";
import "./FestivalCardList.css"; // 스타일 파일을 따로 관리
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


// 카드 위로 올라오는 커스텀 화살표
const NextArrow = ({ onClick }) => (
  <div
    className="custom-arrow-next"
    onClick={onClick}
  >
    <span>〉</span>
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div
    className="custom-arrow-prev"
    onClick={onClick}
  >
    <span>〈</span>
  </div>
);

const FestivalCardList = ({ festivals, token, onToggleLike }) => {
  const settings = {
    slidesToShow: 4,
    slidesToScroll: 1,
    infinite: false,
    arrows: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 3 }
      },
      {
        breakpoint: 900,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 }
      }
    ],

    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
};

  

  useEffect(() => {
    if (!token) return;
    // 좋아요 상태 조회 로직 (필요 시)
  }, [token]);

  if (!Array.isArray(festivals) || festivals.length === 0) {
    return <div className="festival-card-list-empty">등록된 축제가 없습니다.</div>;
  }

  return (
    <div className="festival-card-list" style={{ position: "relative" }}>
      <Slider {...settings}>
        {festivals.map((f) => (
          // key에 likes 포함 → 좋아요 클릭 시 강제 리렌더링
          <FestivalCard
            key={`${f.contentid}-${f.likes}`}
            festival={f}
            token={token}
            onToggleLike={onToggleLike}
          />
        ))}
      </Slider>
    </div>
  );
};

export default FestivalCardList;
