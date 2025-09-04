import "./MainPage.css";
import MainFooter from "./MainFooter";

// 팀장님은 여기에 하시면 될것 같아요^^
const MainPage = () => {

  return (
    <div className="main-page">
      <div className="festival-card-list-container">
        <h3 className="section-title">✨ 현재 진행 중인 축제 ! 여긴 어떠세요? </h3>
      </div>

      <div className="festival-card-list-container">
        <h3 className="section-title">🎊 Comming Soon! 최신 페스티벌은 어디? </h3>
      </div>


      <div className="festival-card-list-container">
        <h3 className="section-title">
          🎉 사용자들이 좋아요 누른
        </h3>
        
      </div>

      <MainFooter />
    </div>
  );
};

export default MainPage;
