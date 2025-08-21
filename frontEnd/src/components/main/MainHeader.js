// src/components/MainHeader.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import "./MainHeader.css";

export default function MainHeader({ isAuthenticated, isAdmin, username, onLogout }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="main-header">
            {/* 왼쪽 - 로고 + 내비 */}
            <div className="header-left">
                <Link to="/" className="logo" onClick={closeMenu}>
                    <h3>세상축제</h3>
                </Link>

                {/* 데스크톱 내비게이션 */}
                <nav className="nav-links" aria-label="주 내비게이션">
                    <Link to="/overview" className="nav-item" onClick={closeMenu}>
                        한눈에 보기
                    </Link>
                    <Link to="/board" className="nav-item" onClick={closeMenu}>
                        게시판
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
                    {/* 🔗 추가: AI 테스트 페이지로 이동 */}
                    <Link to="/ai-test" className="nav-item" onClick={closeMenu}>
                        AI 테스트
                    </Link>
                </nav>
            </div>

            {/* 가운데 - 검색창 */}
            <div className="header-center">
                <div className="search-box" role="search">
                    <input
                        type="text"
                        placeholder="더 뜨거운 여름휴가 보내기"
                        aria-label="검색어 입력"
                    />
                    <button className="search-btn" type="button" aria-label="검색">
                        🔍
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
                                    onLogout?.();
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

                {/* 모바일 - 햄버거 버튼 */}
                <button
                    className="menu-toggle"
                    type="button"
                    aria-label="모바일 메뉴 열기"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                >
                    {menuOpen ? "✖" : "☰"}
                </button>
            </div>

            {/* 모바일 드롭다운 */}
            {menuOpen && (
                <div className="mobile-menu" role="menu" aria-label="모바일 메뉴">
                    <Link to="/overview" onClick={closeMenu} role="menuitem">
                        🗺️ 한눈에 보기
                    </Link>
                    <Link to="/board" onClick={closeMenu} role="menuitem">
                        📝 게시판
                    </Link>
                    {isAuthenticated && !isAdmin && (
                        <Link to="/mypage" onClick={closeMenu} role="menuitem">
                            👤 마이페이지
                        </Link>
                    )}
                    {isAuthenticated && isAdmin && (
                        <Link to="/admin" onClick={closeMenu} role="menuitem">
                            🛠️ 관리자
                        </Link>
                    )}
                    {/* 🔗 추가: AI 테스트 (모바일 메뉴) */}
                    <Link to="/ai-test" onClick={closeMenu} role="menuitem">
                        🤖 AI 테스트
                    </Link>
                    {isAuthenticated ? (
                        <button
                            className="mobile-logout"
                            type="button"
                            onClick={() => {
                                onLogout?.();
                                closeMenu();
                            }}
                        >
                            🚪 로그아웃
                        </button>
                    ) : (
                        <>
                            <Link to="/login" onClick={closeMenu} role="menuitem">
                                🔑 로그인
                            </Link>
                            <Link to="/register" onClick={closeMenu} role="menuitem">
                                ✍️ 회원가입
                            </Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}
