import { useEffect, useState } from "react";
import { 
  fetchFestivalsFromApi, 
  fetchLatestFestivals, 
  fetchPopularFestivalsByLikes,
  fetchPopularFestivalsByViews
} from "../../api/festival"
import FestivalCardList from "../festivals/FestivalCardList";

import "./MainPage.css";

const MainPage = () => {
  const [festivals, setFestivals] = useState([]); // 외부 API
  const [latest, setLatest] = useState([]);       // 최신순
  const [popular, setPopular] = useState([]);     // 인기순
  const [popularSort, setPopularSort] = useState("likes"); // 정렬 기준: likes / views

  // JWT 토큰
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
  useEffect(() => {
    const loadLatest = async () => {
      try {
        const data = await fetchLatestFestivals();
        setLatest(data);
      } catch (err) {
        console.error("최신순 축제 불러오기 실패:", err);
      }
    };
    loadLatest();
  }, []);

  // 인기순 불러오기 (정렬 기준에 따라, 0 제외)
  useEffect(() => {
    const loadPopular = async () => {
      try {
        let data = [];
        if (popularSort === "likes") {
          data = await fetchPopularFestivalsByLikes();
          data = data.filter(f => f.likes > 0);
        } else {
          data = await fetchPopularFestivalsByViews();
          data = data.filter(f => f.views > 0);
        }
        setPopular(data.slice(0, 10)); // 최대 10개
      } catch (err) {
        console.error("인기순 축제 불러오기 실패:", err);
      }
    };
    loadPopular();
  }, [popularSort]);

  return (
    <div className="main-page">
      <div className="festival-card-list-container">
        <h3 className="section-title">✨ 현재 진행 중인 축제 ! 여긴 어떠세요? </h3>
        <FestivalCardList festivals={festivals} token={token} />
      </div>

      <div className="festival-card-list-container">
        <h3 className="section-title">
          🎉 요즘 여기가 HOT 하다며?
          <select
            value={popularSort}
            onChange={(e) => setPopularSort(e.target.value)}
            className="popular-sort-select"
          >
            <option value="likes">좋아요 순</option>
            <option value="views">조회수 순</option>
          </select>
        </h3>
        <FestivalCardList festivals={popular} token={token}/>
      </div>

      <div className="festival-card-list-container">
        <h3 className="section-title">🎊 Comming Soon! 최신 페스티벌은 어디? </h3>
        <FestivalCardList festivals={latest} token={token}/>
      </div>

      <h3 className="section-title"> 👋 "우리 지역 모여라!" 실시간 채팅하러 가기 </h3>
        <div className="online-chat">
          실시간 채팅창 추가 예정
        </div>
    </div>
  );
};

export default MainPage;
