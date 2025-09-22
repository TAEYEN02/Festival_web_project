import { useState } from "react";
import { Play, Search, Heart, Clock, TrendingUp, Smartphone } from "lucide-react";
import "./overview.css";

const OverView = () => {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    // 동영상 재생
    const handleVideoClick = () => {
        setIsVideoPlaying(!isVideoPlaying);
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
            title: "진행중 & 예정중",
            subtitle: "일정별 목록",
            description: "현재 진행중인 축제들과 예정중인 축제들이 모여있는 리스트, 이미 종료된 축제들의 리스트를 볼 수 있습니다.",
            color: "#4ecdc4",
        },
        {
            icon: <Search size={40} />,
            title: "축제 검색 기능",
            subtitle: "키워드 • 지역 기반",
            description: "축제 이름 또는 지역명으로 전국 축제 정보를 검색할 수 있습니다.",
            color: "#ff6b6b",
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
                                        <p>지역 리스트, 지도, 맞춤 검색, 진행중, 예정중, 종료등을 담은 축제 정보 플랫폼</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="BCactiveVideo" onClick={handleVideoClick}>
                                <div className="BCvideoPlayer">
                                    <video autoPlay loop muted className='BCvideoPreview' src='media/overview.mp4' alt="Video Preview" />
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* 기능 소개 섹션 */}
                <div className="festival-card-list-container">
                    <h3 className="section-title">🚀 한눈에 보기 페이지 주요 기능</h3>
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
        </div>
    );
};

export default OverView;
