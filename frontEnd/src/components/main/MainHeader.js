import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // 🔹 AuthContext import
import { FaSearch } from "react-icons/fa";

import "./MainHeader.css";

export default function MainHeader() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [query, setQuery] = useState("");
    const { isAuthenticated, user, logout } = useAuth(); // 🔹 컨텍스트에서 가져오기
    
    const isAdmin = user?.roles?.includes("ROLE_ADMIN"); // 🔹 역할 판별
    const username = user?.username || "";
    const navigate = useNavigate();

    const closeMenu = () => setMenuOpen(false);

    const handleInputChange = (e) => setQuery(e.target.value);

    const handleSearch = () => {
        if(!query.trim()) return;
        navigate(`/festivals/search?query=${encodeURIComponent(query)}`);
        setQuery("");
        closeMenu();
    };

    const handleKeyDown = (e) => {
        if(e.key === "Enter") handleSearch();
    };

    return (
        <header className="main-header">
            {/* 왼쪽 - 로고 + 내비 */}
            <div className="header-left">
                <Link to="/" className="logo" onClick={closeMenu}>
                    <h3>세상축제</h3>
                </Link>

                <nav className="nav-links" aria-label="주 내비게이션">
                    <Link to="/overview" className="nav-item" onClick={closeMenu}>
                        한눈에 보기
                    </Link>
                    <Link to="/board" className="nav-item" onClick={closeMenu}>
                        커뮤니티
                    </Link>
                    {isAuthenticated && !isAdmin && (
                        <Link to="/mypage" className="nav-item" onClick={closeMenu}>
                            마이페이지
                        </Link>
                    )}
                    {isAuthenticated && isAdmin && (
                        <Link to="/admin" className="nav-item" onClick={closeMenu}>
                            관리자
                        </Link>
                    )}
                    <Link to="/ai-test" className="nav-item2" onClick={closeMenu}>
                        AI 방방곡곡
                    </Link>
                </nav>
            </div>

            {/* 가운데 - 검색창 */}
            <div className="header-center">
            <div className="search-box" role="search">
                <input
                type="text"
                placeholder="키워드로 축제 검색해보기"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                />
                <button className="search-btn" type="button" onClick={handleSearch}>
                <FaSearch />
                </button>
            </div>
            </div>


            {/* 오른쪽 - 인증/모바일 토글 */}
            <div className="header-right">
                <div className="auth-actions">
                    {isAuthenticated ? (
                        <>
                            <span className="username">{username}님</span>
                            <button
                                className="btn-logout"
                                type="button"
                                onClick={() => {
                                    logout();   // 🔹 바로 AuthContext의 logout 실행
                                    closeMenu();
                                }}
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-item" onClick={closeMenu}>
                                로그인
                            </Link>
                            <Link to="/register" className="nav-item" onClick={closeMenu}>
                                회원가입
                            </Link>
                        </>
                    )}
                </div>

                {/* 모바일 햄버거 버튼 */}
                <button
                    className="menu-toggle"
                    type="button"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                >
                    {menuOpen ? "✖" : "☰"}
                </button>
            </div>

            {/* 모바일 드롭다운 */}
            {menuOpen && (
                <div className="mobile-menu" role="menu">
                    <Link to="/overview" onClick={closeMenu}>🗺️ 한눈에 보기</Link>
                    <Link to="/board" onClick={closeMenu}>📝 게시판</Link>
                    {isAuthenticated && !isAdmin && (
                        <Link to="/mypage" onClick={closeMenu}>👤 마이페이지</Link>
                    )}
                    {isAuthenticated && isAdmin && (
                        <Link to="/admin" onClick={closeMenu}>🛠️ 관리자</Link>
                    )}
                    <Link to="/ai-test" onClick={closeMenu}>🤖 AI 테스트</Link>

                    {isAuthenticated ? (
                        <button
                            className="mobile-logout"
                            type="button"
                            onClick={() => {
                                logout();   // 🔹 모바일 메뉴에서도 로그아웃
                                closeMenu();
                            }}
                        >
                            🚪 로그아웃
                        </button>
                    ) : (
                        <>
                            <Link to="/login" onClick={closeMenu}>🔑 로그인</Link>
                            <Link to="/register" onClick={closeMenu}>✍️ 회원가입</Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}