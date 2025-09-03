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

const FestivalCardList = ({ festivals, festivalId, token, onToggleLike }) => {
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
  if (!token) return;  // 로그인 안 된 경우 skip
  // 좋아요 상태 조회 로직
}, [festivalId, token]);

  return (
    <div className="festival-card-list" style={{ position: "relative" }}>
      <Slider key={festivals.map(f => f.contentid).join("-")} {...settings}>
        {festivals.map(f => (
          <FestivalCard key={f.contentid} festival={f} onToggleLike={onToggleLike} />
        ))}
      </Slider>
    </div>
  );
};

export default FestivalCardList;
