import { useState } from "react";
import { Play, Search, Heart, Clock, TrendingUp, Smartphone } from "lucide-react";
import "./ai-test.css";

const AiTest = () => {
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
            title: "스타일 & 옵션",
            subtitle: "일정 플래너",
            description: "출발 위치와 도착 위치 그리고 각 항목별 세분화 선택탭을 제공합니다.",
            color: "#4ecdc4",
        },
        {
            icon: <Search size={40} />,
            title: "AI 일정 생성",
            subtitle: "키워드 • 지역 기반",
            description: "각 항목에서 선택된 데이터를 통해 AI가 일정을 생성해줍니다.",
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
                                        <h2>AI 여행 일정 플래너</h2>
                                        <p>출발, 도착지, 각 항목등을 통한 AI의 여행 일정 생성 기능 </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="BCactiveVideo" onClick={handleVideoClick}>
                                <div className="BCvideoPlayer">
                                    <video autoPlay loop muted className='BCvideoPreview' src='media/ai-test.mp4' alt="Video Preview" />
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* 기능 소개 섹션 */}
                <div className="festival-card-list-container">
                    <h3 className="section-title">🚀 AI 방방곡곡 주요 기능 </h3>
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

export default AiTest;
