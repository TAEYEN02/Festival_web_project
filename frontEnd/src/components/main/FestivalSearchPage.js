// 검색 결과 페이지
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchFestivals } from "../../api/festival";
import FestivalCardGrid from "../../components/festivals/FestivalCardGrid";
import MainFooter from "./MainFooter";

import "./FestivalSearchPage.css";

export default function FestivalSearchPage() {
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 한 페이지에 보여줄 축제 개수

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("query") || "";

  useEffect(() => {
    const fetchResults = async () => {
      const data = await searchFestivals(query);
      setResults(data);
      setCurrentPage(1); // 검색어 변경 시 첫 페이지로 초기화
    };
    fetchResults();
  }, [query]);

  // 현재 페이지에 보여줄 축제 리스트
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const currentItems = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  return (
    <div className="festival-search-page-container">
      <span className="title">
        ✨ {results.length}개의 축제 발견! 즐거운 일정 찾아보세요
      </span>

      <FestivalCardGrid festivals={currentItems} />

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={handlePrev} disabled={currentPage === 1}>
            이전
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button onClick={handleNext} disabled={currentPage === totalPages}>
            다음
          </button>
        </div>
      )}
        <MainFooter />
    </div>
  );
}
