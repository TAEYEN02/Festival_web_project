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
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 4,   // 기본 4개
  slidesToScroll: 1,
  adaptiveHeight: true,   // 카드 내용에 따라 슬라이드 높이 자동 조정
  responsive: [
    {
      breakpoint: 1200,  // 화면 1200px 이하
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 900,  // 화면 900px 이하
      settings: {
        slidesToShow: 2,
      },
    },
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
