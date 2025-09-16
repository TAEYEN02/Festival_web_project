import FestivalCard from "./FestivalCard";
import "./FestivalCardGrid.css";


const FestivalCardGrid = ({ festivals, token, onToggleLike }) => {
  if (!Array.isArray(festivals) || festivals.length === 0) {
    return <div className="festival-card-grid-empty">등록된 축제가 없습니다.</div>;
  }

  return (
    <div className="festival-card-grid">
      {festivals.map((f) => (
        <FestivalCard
          key={`${f.contentId}-${f.likesCount}`}
          festival={f}
          token={token}
          onToggleLike={onToggleLike}
        />
      ))}
    </div>
  );
};

export default FestivalCardGrid;
