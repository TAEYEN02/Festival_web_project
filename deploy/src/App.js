import { Routes, Route} from "react-router-dom";
import MainHeader from "./components/main/MainHeader";
import MainPage from "./components/main/MainPage";

import './App.css';

function App() {
  return (
    <div>
            <MainHeader />

            <Routes>
                {/* 메인 - 축제 리스트 */}
                <Route path="/" element={<MainPage />} />

                {/* AI 일정 추천 */}
                <Route path="/ai-test" element={''} />

                {/* 공개 페이지 */}
                <Route path="/overview" element={''} />

                {/* 상세 페이지 */}
                <Route path="/festival/:id" element={''} />

                {/* 로그인-회원가입-회원가입 */}
                <Route path="/register" element={''} />

                {/* 관리자 */}
                <Route path="/admin" element={''}/>

                {/* 마이페이지 */}
                <Route path="/mypage" element={''} />

                {/* 게시판*/}
                <Route path='/board' element={''} />
            </Routes>
        </div>
  );
}

export default App;
