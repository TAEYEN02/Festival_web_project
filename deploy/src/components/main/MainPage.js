import { useState } from 'react';
import { Play, Search, Heart, Clock, TrendingUp, Smartphone } from "lucide-react";
import "./MainPage.css";
import MainFooter from "./MainFooter";

const MainPage = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // 동영상 재생
  const handleVideoClick = () => {
        setIsVideoPlaying(true);
    };


  const features = [
    {
      icon: <TrendingUp size={40} />,
      title: "공공데이터포털 API 연동",
      subtitle: "실시간 데이터 제공",
      description: "실제 공공데이터를 불러와 최신 축제 정보를 신뢰성 있게 제공합니다.",
      color: "#feca57",
    },
    {
      icon: <Clock size={40} />,
      title: "최신순 & 인기순",
      subtitle: "정렬 • 추천 리스트",
      description: "곧 다가오는 축제들이 모여있는 최신순 리스트, 사용자들이 좋아하는 축제 인기순 리스트를 볼 수 있습니다.",
      color: "#4ecdc4",
    },
    {
      icon: <Heart size={40} />,
      title: "좋아요 기능 & 목록 관리",
      subtitle: "나만의 축제",
      description: "마음에 드는 축제에 좋아요를 누르고, 내가 찜한 목록을 따로 확인할 수 있습니다.",
      color: "#45b7d1",
    },
    {
      icon: <Search size={40} />,
      title: "축제 검색 기능",
      subtitle: "키워드 • 지역 기반",
      description: "축제 이름 또는 지역명으로 전국 축제 정보를 검색할 수 있습니다.",
      color: "#ff6b6b",
    },
    {
      icon: <Smartphone size={40} />,
      title: "반응형 디자인",
      subtitle: "PC • 모바일 • 태블릿",
      description: "어떤 기기에서도 최적화된 화면으로 축제 정보를 편리하게 이용할 수 있습니다.",
      color: "#54a0ff",
    },
  ];

  return (
    <div className="main-page">
      <div className="BCcontainer">
        <section className="BCheroSection">
            <div className="BCvideoContainer">
                {!isVideoPlaying ? (
                    <div className="BCvideoPreview" onClick={handleVideoClick}>
                        <div className="BCvideoThumbnail">
                            <div className="BCplayButton">
                                <Play size={60} fill="white" />
                            </div>
                            <div className="BCvideoOverlay">
                                <h2>전국 축제를 한눈에</h2>
                                <p>최신순·인기순 리스트, 맞춤 검색, 좋아요 기능까지 담은 축제 정보 플랫폼</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="BCactiveVideo">
                        <div className="BCvideoPlayer">
                            <video autoPlay loop muted className='BCvideoPreview' src='media/main.mp4' alt="Video Preview" />
                        </div>
                    </div>
                )}
            </div>
        </section>

     {/* 기능 소개 섹션 */}
      <div className="festival-card-list-container">
        <h3 className="section-title">🚀 메인페이지의 주요 기능</h3>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <h4>{feature.subtitle}</h4>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
      </div>

      <MainFooter />
    </div>
  );
};

export default MainPage;
