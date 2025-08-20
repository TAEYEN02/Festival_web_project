import React, { useState } from "react";
import { Link } from "react-router-dom";


const MainHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="main-header">
      {/* 왼쪽 - 로고 */}
      <div className="header-left">
        <Link to="/" className="logo">
          <h3>FestivalGo</h3>
        </Link>
      </div>

      {/* 가운데 - 검색창 (태블릿 이상에서 보임) */}
      <div className="header-center">
        <div className="search-box">
          <input type="text" placeholder="더 뜨거운 여름휴가 보내기" />
          <button className="search-btn">🔍</button>
        </div>
      </div>

      {/* 오른쪽 - 메뉴 */}
      <div className="header-right">
        {/* PC/태블릿 메뉴 */}
        <nav className="nav-links">
          <Link to="/mypage" className="nav-item">
            👤 <span>마이페이지</span>
          </Link>
          <Link to="/likes" className="nav-item">
            ❤️ <span>좋아요</span>
          </Link>
          <Link to="/recent" className="nav-item">
            ⏰ <span>최근 본 축제</span>
          </Link>
        </nav>

        {/* 모바일 - 햄버거 버튼 */}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/mypage" onClick={() => setMenuOpen(false)}>
            👤 마이페이지
          </Link>
          <Link to="/likes" onClick={() => setMenuOpen(false)}>
            ❤️ 좋아요
          </Link>
          <Link to="/recent" onClick={() => setMenuOpen(false)}>
            ⏰ 최근 본 축제
          </Link>
        </div>
      )}
    </header>
  );
};

export default MainHeader;
