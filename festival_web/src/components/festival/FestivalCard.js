import React from "react";
import { useNavigate } from "react-router-dom";


const FestivalCard = ({ festival }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/festivals/detail/${festival.contentid}`);
  };

  const defaultImg = "/default.jpg"; // 축제 사진이 뜨지 않을 경우 기본 이미지

  // 날짜 형식 포맷
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return `${dateStr.slice(0,4)}.${dateStr.slice(4,6)}.${dateStr.slice(6,8)}`;
  };

  // D-DAY, 진행중, 당일, 종료
  const calcDDay = (startDate, endDate) => {
    if (!startDate || !endDate) return { status: "", text: "" };

    const today = new Date();
    const start = new Date(
      startDate.slice(0,4),
      startDate.slice(4,6) - 1,
      startDate.slice(6,8)
    );
    const end = new Date(
      endDate.slice(0,4),
      endDate.slice(4,6) - 1,
      endDate.slice(6,8)
    );

    const diffToStart = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
    const diffToEnd = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

    if (diffToStart > 0) return { status: "upcoming", text: `D-${diffToStart}` };
    if (diffToStart === 0) return { status: "today", text: "D-Day" };
    if (diffToStart < 0 && diffToEnd >= 0) return { status: "ongoing", text: "진행중" };
    return { status: "ended", text: "종료" };
  };

  return (
    <div className="festival-card" onClick={handleClick}>
      <img
        src={festival.firstimage && festival.firstimage !== "" 
              ? festival.firstimage 
              : defaultImg}
        alt={festival.title}
        className="festival-image"
      />
      <div className="festival-info">
        <h3 className="festival-title">{festival.title}</h3>
        <p className="festival-location">{festival.addr1}</p>
        <div className="festival-period-wrapper">
          <span className="festival-period">
            {formatDate(festival.eventstartdate)} ~ {formatDate(festival.eventenddate)}
          </span>
          {(() => {
            const { status, text } = calcDDay(festival.eventstartdate, festival.eventenddate);
            return <span className={`festival-dday ${status}`}>{text}</span>;
          })()}
        </div>
      </div>
    </div>
  );
};

export default FestivalCard;
