import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import AdminDashboard from "./components/admin/AdminDashboard";
import MyPage from "./components/user/MyPage";
import RegionOverviewPage from "./components/RegionOverview/RegionOverviewPage";
import MainHeader from "./components/main/MainHeader";
import FestivalDetail from "./components/festivals/FestivalDetail";
import MainPage from "./components/main/MainPage";
import AITestPage from "./components/festivalAI/AITestPage";

// 게시판 관련
import { BoardLayout } from "./components/board/BoardLayout";
import { BoardList } from "./components/board/BoardList";
import { BoardWrite } from "./components/board/BoardWrite";
import { BoardDetail } from "./components/board/BoardDetail";

import { ReviewList } from "./components/board/ReviewList";
import { ReviewWrtie } from "./components/board/ReviewWrite";
import { ReviewDetail } from "./components/board/ReviewDetail";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState({ username: "", roles: [] });
    const navigate = useNavigate();

    // 페이지 로드 시 JWT 토큰 체크
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1])); // JWT 디코딩
                const roles =
                    Array.isArray(payload.roles)
                        ? payload.roles
                        : Array.isArray(payload.authorities)
                        ? payload.authorities
                        : payload.roles
                        ? String(payload.roles).split(",")
                        : [];
                setUser({ username: payload.sub, roles });
                setIsAuthenticated(true);
            } catch (err) {
                console.error("JWT parsing error:", err);
                localStorage.removeItem("token");
                setIsAuthenticated(false);
                setUser({ username: "", roles: [] });
            }
        }
    }, []);

    const handleLogin = (userData, token) => {
        localStorage.setItem("token", token);
        const roles = Array.isArray(userData.roles)
            ? userData.roles
            : userData.roles
            ? String(userData.roles).split(",")
            : [];
        setUser({ username: userData.username, roles });
        setIsAuthenticated(true);

        if (roles.includes("ROLE_ADMIN")) {
            navigate("/admin", { replace: true });
        } else {
            navigate("/mypage", { replace: true });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser({ username: "", roles: [] });
        navigate("/overview", { replace: true });
    };

    const isAdmin = user?.roles?.includes("ROLE_ADMIN");

    return (
        <div>
            <MainHeader
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
                username={user?.username}
                onLogout={handleLogout}
            />

            <Routes>
                {/* 메인 - 축제 리스트 */}
                <Route path="/" element={<MainPage />} />

                { /* AI 테스트 화면 */}
                <Route path="/ai-test" element={<AITestPage />} />
                
                {/* 공개 페이지 */}
                <Route path="/overview" element={<RegionOverviewPage />} />

                {/* 상세 페이지 */}
                <Route path="/festival/:id" element={<FestivalDetail />} />

                {/* 로그인 */}
                <Route
                    path="/login"
                    element={
                        !isAuthenticated ? (
                            <LoginForm
                                onLogin={handleLogin}
                                onSwitchToRegister={() =>
                                    navigate("/register", { replace: true })
                                }
                            />
                        ) : isAdmin ? (
                            <Navigate to="/admin" replace />
                        ) : (
                            <Navigate to="/mypage" replace />
                        )
                    }
                />

                {/* 회원가입 */}
                <Route
                    path="/register"
                    element={
                        !isAuthenticated ? (
                            <RegisterForm
                                onRegister={() =>
                                    navigate("/login", { replace: true })
                                }
                            />
                        ) : (
                            <Navigate
                                to={isAdmin ? "/admin" : "/mypage"}
                                replace
                            />
                        )
                    }
                />

                {/* 관리자 */}
                <Route
                    path="/admin"
                    element={
                        isAuthenticated && isAdmin ? (
                            <AdminDashboard onLogout={handleLogout} />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* 마이페이지 */}
                <Route
                    path="/mypage"
                    element={
                        isAuthenticated ? (
                            <MyPage onLogout={handleLogout} />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* 루트 분기 */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            isAdmin ? (
                                <Navigate to="/admin" replace />
                            ) : (
                                <Navigate to="/mypage" replace />
                            )
                        ) : (
                            <Navigate to="/overview" replace />
                        )
                    }
                />

                {/* 게시판 라우트 */}
                <Route path='/board' element={<BoardLayout/>} >
                <Route index element={<Navigate to='/board/0' />} />
                <Route path=':categoryId' element={<BoardList />} />
                <Route path=':categoryId/write' element={<BoardWrite />} />
                <Route path=':categoryId/detail/:boardId' element={<BoardDetail />} />

                <Route path='review' element={<ReviewList />} />
                <Route path='review/write' element={<ReviewWrtie />} />
                <Route path='review/detail/:reviewId' element={<ReviewDetail />} />
                </Route>

                {/* 없는 경로 */}
                <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
        </div>
    );
}

export default App;
