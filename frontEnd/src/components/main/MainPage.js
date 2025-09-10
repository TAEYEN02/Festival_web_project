import { useEffect, useState } from "react";
import { 
  fetchFestivalsFromApi, 
  fetchLatestFestivals, 
  fetchPopularFestivalsByLikes,
  fetchPopularFestivalsByViews
} from "../../api/festival";
import FestivalCardList from "../festivals/FestivalCardList";
import MainFooter from "./MainFooter";

import "./MainPage.css";

const MainPage = () => {
  const [festivals, setFestivals] = useState([]); // 외부 API
  const [latest, setLatest] = useState([]);       // 최신순
  const [popular, setPopular] = useState([]);     // 인기순
  const [popularSort, setPopularSort] = useState("likes"); // 정렬 기준

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
       console.log("백엔드 반환 데이터:", data);
      setLatest(data ?? []);
    } catch (err) {
      console.error("최신순 축제 불러오기 실패:", err);
      setLatest([]);
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

  // 페이지 초기 데이터 불러오기
  useEffect(() => {
    loadLatest();
    loadPopular();
  }, [popularSort]);

  // 좋아요 토글
  const handleToggleLike = (contentId, updatedCount) => {
    const strId = String(contentId);

    // 최신순 리스트도 즉시 반영 + 객체 참조 새로 생성
    setLatest(prev =>
      prev.map(f =>
        String(f.contentid) === strId
          ? { ...f, likes: updatedCount }
          : { ...f }
      )
    );

    // 인기순 리스트 즉시 반영
    setPopular(prev =>
      prev.map(f =>
        String(f.contentid) === strId
         ? { ...f, likes: updatedCount }
          : { ...f }
      )
    );
  };

  return (
    <div className="main-page">
      <div className="festival-card-list-container">
        <h3 className="section-title">✨ 현재 진행 중인 축제 ! 여긴 어떠세요? </h3>
        <FestivalCardList festivals={festivals} token={token} />
      </div>

      <div className="festival-card-list-container">
        <h3 className="section-title">🎊 Comming Soon! 최신 페스티벌은 어디? </h3>
        <FestivalCardList
          key={`latest-${latest.map(f => f.likes).join("-")}`}
          festivals={latest}
          token={token}
          onToggleLike={handleToggleLike} // 최신순 토글은 서버 fetch로 처리
        />
      </div>

      <div className="festival-card-list-container">
        <h3 className="section-title">🎉 사용자들이 좋아요 누른</h3>
        <FestivalCardList
          key={`popular-${popular.map(f => f.likes).join("-")}`}
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
