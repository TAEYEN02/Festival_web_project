import Slider from "react-slick";
import FestivalCard from "./FestivalCard";
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

const FestivalCardList = ({ festivals }) => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div className="festival-card-list" style={{ position: "relative" }}>
      <Slider {...settings}>
        {festivals.map((festival) => (
          <FestivalCard key={festival.contentId} festival={festival} />
        ))}
      </Slider>
    </div>
  );
};

export default FestivalCardList;
