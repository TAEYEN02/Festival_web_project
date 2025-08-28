import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import AdminDashboard from "./components/admin/AdminDashboard";
import MyPage from "./components/user/MyPage";
import RegionOverviewPage from "./components/RegionOverview/RegionOverviewPage";
import MainHeader from "./components/main/MainHeader";
import FestivalDetail from "./components/festivals/FestivalDetail";
import MainPage from "./components/main/MainPage";
import AITestPage from "./components/festivalAI/AITestPage";
import { AuthProvider, useAuth } from './context/AuthContext';

// 게시판 관련
import { BoardLayout } from "./components/board/BoardLayout";
import { BoardList } from "./components/board/BoardList";
import { BoardWrite } from "./components/board/BoardWrite";
import { BoardDetail } from "./components/board/BoardDetail";

import { ReviewList } from "./components/board/review/ReviewList";
import { ReviewWrtie } from "./components/board/review/ReviewWrite";
import { ReviewDetail } from "./components/board/review/ReviewDetail";

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

// AuthProvider 내부에서 useAuth 훅 사용
function AppContent() {
    const { isAuthenticated, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.2rem'
            }}>
                로딩 중...
            </div>
        );
    }

    // ROLE_ADMIN 체크 (백엔드에서 ADMIN으로 오면 ROLE_ADMIN으로 변환됨)
    const isAdmin = user?.roles?.includes("ROLE_ADMIN");

    console.log('App - user:', user);
    console.log('App - isAdmin:', isAdmin);
    console.log('App - user roles:', user?.roles);

    return (
        <div>
            <MainHeader
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
                username={user?.username}
            />

            <Routes>
                {/* 메인 - 축제 리스트 */}
                <Route path="/" element={<MainPage />} />

                {/* AI 테스트 화면 */}
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
                            <LoginForm />
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
                            <RegisterForm />
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
                            <AdminDashboard />
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
                            <MyPage />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* 게시판 라우트 */}
                <Route path='/board' element={<BoardLayout />} >
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