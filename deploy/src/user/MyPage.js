import { Play, User, Heart, Calendar, MessageCircle, Camera } from "lucide-react";
import "./MyPage.css";
import MainFooter from "../components/main/MainFooter";
import { useState } from "react";

const MyPage = () => {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    
    // 동영상 재생
  const handleVideoClick = () => {
        setIsVideoPlaying(!isVideoPlaying);
    };
;

  const features = [
    {
      icon: <User size={40} />,
      title: "프로필 관리",
      subtitle: "회원 정보 조회 및 수정",
      description:
        "아이디, 닉네임, 이메일, 가입일 등 내 정보를 확인하고 필요시 수정하거나 비밀번호를 변경할 수 있습니다.",
      color: "#ff6b6b",
    },
    {
      icon: <Camera size={40} />,
      title: "프로필 사진 변경",
      subtitle: "나만의 프로필 꾸미기",
      description:
        "프로필 사진을 변경하여 나만의 아이덴티티를 만들어보세요.",
      color: "#54a0ff",
    },
    {
      icon: <Heart size={40} />,
      title: "좋아요 목록",
      subtitle: "내가 좋아요 한 축제",
      description:
        "마음에 드는 축제에 좋아요를 누른 목록을 한눈에 확인하고 다시 방문해보세요.",
      color: "#4ecdc4",
    },
    {
      icon: <Calendar size={40} />,
      title: "AI 일정 추천",
      subtitle: "내 AI 일정 저장",
      description:
        "AI 플래너가 추천해준 내 맞춤형 축제 일정들을 저장하고 언제든 다시 확인할 수 있습니다.",
      color: "#45b7d1",
    },
    {
      icon: <MessageCircle size={40} />,
      title: "1:1 문의함",
      subtitle: "관리자와 소통",
      description:
        "관리자에게 1:1 문의를 남기고, 이전 문의 내역도 확인할 수 있습니다.",
      color: "#feca57",
    },
  ];

  return (
    <div className="mypage-container">
      {/* 유저 정보 섹션 */}
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
                                <h2>내 축제 기록, 내 손안에</h2>
                                <p>내 정보, 좋아요 목록, AI 일정 목록, 1:1 문의까지 
                                모든 기능을 한 곳에서 편리하게</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="BCactiveVideo" onClick={handleVideoClick}>
                        <div className="BCvideoPlayer">
                            <video autoPlay loop muted className='BCvideoPreview' src='media/mypage.mp4' alt="Video Preview" />
                        </div>
                    </div>
                )}
            </div>
        </section>

      {/* 기능 섹션 */}
      <div className="mypage-features">
        <h3 className="mypage-section-title">🛠️ MyPage 기능</h3>
        <div className="mypage-features-grid">
          {features.map((feature, index) => (
            <div key={index} className="mypage-feature-card">
              <div
                className="mypage-feature-icon"
                style={{ color: feature.color }}
              >
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <h4>{feature.subtitle}</h4>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <MainFooter />
    </div>
    </div>
  );
};

export default MyPage;
