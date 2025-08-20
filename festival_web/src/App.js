import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainHeader from "./components/common/MainHeader.js"
import Footer from "./components/common/Footer";
import MainPage from "./pages/MainPage.js";
import FestivalListPage from "./pages/FestivalListPage.js";
import FestivalDetailPage from "./pages/FestivalDetailPage";

import "./styles/styles.css";

function App() {
  return (
    <Router>
      <div className="App">
        {/* 상단 헤더 */}
        <MainHeader />

        <Routes>
          {/* 메인 - 축제 리스트 */}
          <Route path="/" element={<MainPage />} />
          {/* 상세페이지 */}
          <Route path="/festivals/detail/:contentId" element={<FestivalDetailPage />} />
        </Routes>

        {/* 하단 Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
