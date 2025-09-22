import { Routes, Route} from "react-router-dom";
import MainHeader from "./components/main/MainHeader";
import MainPage from "./components/main/MainPage";

import './App.css';
import BoardComponent from "./components/board/BoardComponent";
import OverView from "./components/overview/overview";
import AiTest from "./components/ai/ai-test";
import MyPage from "./user/MyPage";
import { AdminPage } from "./components/auth/AdminPage";
import { AuthPage } from "./components/auth/AuthPages";

function App() {
  return (
    <div>
            <MainHeader />

            <Routes>
                {/* 메인 - 축제 리스트 */}
                <Route path="/" element={<MainPage />} />

                {/* AI 일정 추천 */}
                <Route path="/ai-test" element={<AiTest />} />

                {/* 공개 페이지 */}
                <Route path="/overview" element={<OverView />} />

                {/* 로그인-회원가입-회원가입 */}
                <Route path="/register" element={<AuthPage/>} />

                {/* 관리자 */}
                <Route path="/admin" element={<AdminPage/>}/>

                {/* 마이페이지 */}
                <Route path="/mypage" element={<MyPage />} />

                {/* 게시판*/}
                <Route path='/board' element={<BoardComponent/>} />
            </Routes>
        </div>
  );
}

export default App;
