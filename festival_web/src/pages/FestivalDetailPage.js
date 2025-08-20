import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchFestivalDetail } from "../api/festival";

const FestivalDetailPage = () => {
  const { contentId } = useParams();
  const [festival, setFestival] = useState(null);

  useEffect(() => {
    const fetchFestival = async () => {
      if (!contentId) return;
      const data = await fetchFestivalDetail(contentId);
      setFestival(data);
    };
    fetchFestival();
  }, [contentId]);

  if (!festival) return <p>Loading...</p>;

  return (
    <div className="festival-detail-page" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>{festival.title}</h1>
      <img
        src={festival.firstImage || "/default.jpg"}
        alt={festival.title}
        style={{ width: "100%", borderRadius: "8px", marginBottom: "20px" }}
      />
      <p><strong>기간:</strong> {festival.startDate} ~ {festival.endDate}</p>
      <p><strong>장소:</strong> {festival.location}</p>
      {festival.homepage && (
        <p>
          <strong>홈페이지:</strong>{" "}
          <a href={festival.homepage} target="_blank" rel="noopener noreferrer">
            {festival.homepage}
          </a>
        </p>
      )}
      <p style={{ marginTop: "20px", lineHeight: "1.6" }}>{festival.description}</p>
    </div>
  );
};

export default FestivalDetailPage;
