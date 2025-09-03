// 최신순 카드 리스트
import Slider from "react-slick";
import FestivalCard from "./FestivalCard";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const LatestFestivalCardList = ({ festivals, onToggleLike }) => {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
  };

  return (
    <Slider key="latest-slider" {...settings}>
      {festivals.map((festival, idx) => (
        <FestivalCard
          key={festival.contentid}
          festival={festival}
          rank={idx + 1}
          onToggleLike={onToggleLike}
        />
      ))}
    </Slider>
  );
};

export default LatestFestivalCardList;
