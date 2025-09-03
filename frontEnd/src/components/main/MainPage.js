import { useEffect, useState } from "react";
import { 
  fetchFestivalsFromApi, 
  fetchLatestFestivals, 
  fetchPopularFestivalsByLikes,
  fetchPopularFestivalsByViews
} from "../../api/festival"
import FestivalCardList from "../festivals/FestivalCardList";
import LatestFestivalCardList from "../festivals/LatestFestivalCardList";

import "./MainPage.css";
import MainFooter from "./MainFooter";

const MainPage = () => {
  const [festivals, setFestivals] = useState([]); // 외부 API
  const [latest, setLatest] = useState([]);       // 최신순
  const [popular, setPopular] = useState([]);     // 인기순
  const [popularSort, setPopularSort] = useState("likes"); // 정렬 기준: likes / views

  const token = localStorage.getItem("token");

  // 외부 API 데이터 불러오기
  useEffect(() => {
    const loadExternalFestivals = async () => {
      try {
        const data = await fetchFestivalsFromApi();
        setFestivals(data);
      } catch (err) {
        console.error("외부 API 축제 불러오기 실패:", err);
      }
    };
    loadExternalFestivals();
    
  }, []);

  // 최신순 불러오기
   const loadLatest = async () => {
    try {
      const data = await fetchLatestFestivals();
      if (!data || data.length === 0) {
        // 서버가 빈 배열 반환하면 fallback 처리
        setLatest([]); // 혹은 랜덤 10개 데이터
      } else {
        setLatest(data);
      }
    } catch (err) {
      console.error("최신순 축제 불러오기 실패:", err);
    }
  };

  // 인기순 불러오기
  const loadPopular = async () => {
    try {
      let data = [];
      if (popularSort === "likes") {
        data = await fetchPopularFestivalsByLikes();
        const nonZeroLikes = data.filter(f => f.likes > 0);
        data = nonZeroLikes.length > 0
          ? nonZeroLikes.slice(0, 10)
          : data.sort(() => 0.5 - Math.random()).slice(0, 10);
      } else {
        data = await fetchPopularFestivalsByViews();
        const nonZeroViews = data.filter(f => f.views > 0);
        data = nonZeroViews.length > 0
          ? nonZeroViews.slice(0, 10)
          : data.sort(() => 0.5 - Math.random()).slice(0, 10);
      }
      setPopular(data);
    } catch (err) {
      console.error("인기순 축제 불러오기 실패:", err);
    }
  };

  useEffect(() => {
     loadLatest(); loadPopular(); 

  }, []);

  // 좋아요 토글 시 최신순에서 좋아요 수만 업데이트
  const handleToggleLike = (contentId, updatedCount) => {
    setLatest(prev => prev.map(f => f.contentid === contentId ? { ...f, likes: updatedCount } : f));
    loadPopular(); // 인기순은 다시 fetch
  };

  return (
    <div className="main-page">
      <div className="festival-card-list-container">
        <h3 className="section-title">✨ 현재 진행 중인 축제 ! 여긴 어떠세요? </h3>
        <FestivalCardList festivals={festivals} token={token} />
      </div>

      <div className="festival-card-list-container">
        <h3 className="section-title">🎊 Comming Soon! 최신 페스티벌은 어디? </h3>
        <FestivalCardList festivals={latest} token={token} onToggleLike={handleToggleLike} />
      </div>


      <div className="festival-card-list-container">
        <h3 className="section-title">
          🎉 사용자들이 좋아요 누른
        </h3>
        <FestivalCardList
          festivals={popular}
          token={token}
          onToggleLike={handleToggleLike}
        />
      </div>

      <MainFooter />
    </div>
  );
};

export default MainPage;
