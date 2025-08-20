// src/page/MainPage.js
import React, { useEffect, useState } from "react";
import { fetchFestivalsFromApi } from "../api/festival";
import FestivalCardList from "../components/festival/FestivalCardList";


const MainPage = () => {
  const [festivals, setFestivals] = useState([]);

  useEffect(() => {
    const loadFestivals = async () => {
      const data = await fetchFestivalsFromApi();
      setFestivals(data);
    };
    loadFestivals();
  }, []);

  return (
    <div className="main-page">
      <h3 className="section-title">✨ 현재 진행 중인 HOT 한 축제!</h3>
      <FestivalCardList festivals={festivals} />
    </div>
  );
};

export default MainPage;
