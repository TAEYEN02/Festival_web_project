import { useState } from 'react';
import { Play, MessageCircle, MapPin, Star, ChevronRight } from 'lucide-react';
import '../board/BoardComponent.css';

export const AdminPage = () => {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    const handleVideoClick = () => {
        setIsVideoPlaying(!isVideoPlaying);
    };

    const features = [
        {
            icon: <Star size={40} />,
            title: '관리자 대시보드',
            subtitle: '한눈에 보는 시스템',
            description: '시스템 연결상태, 총 사용자 수, 최근 가입자, 최근 1:1 문의, 사용자 증가 추이(그래프), 지역별 채팅 현황을 한눈에 확인할 수 있습니다.',
            color: '#ff6b6b'
        },
        {
            icon: <MessageCircle size={40} />,
            title: '사용자 관리',
            subtitle: '회원 정보 조회 및 제어',
            description: '전체 사용자 목록을 조회하고, 개별 사용자 정보를 확인하거나 필요 시 삭제할 수 있습니다.',
            color: '#4ecdc4'
        },
        {
            icon: <MapPin size={40} />,
            title: '1:1 문의 관리',
            subtitle: '실시간 문의 응답',
            description: '사용자가 남긴 1:1 문의를 확인하고 관리자 계정에서 직접 응답할 수 있습니다.',
            color: '#45b7d1'
        },
        {
            icon: <Play size={40} />,
            title: '실시간 채팅 관리',
            subtitle: '지역별 접속자 현황',
            description: '지역별 채팅방에 접속한 사용자 수를 확인하고 채팅 상태를 모니터링할 수 있습니다.',
            color: '#f9a825'
        }
    ];
    return (
        <div className="BCcontainer">
            {/* Hero Section with Video */}
            <section className="BCheroSection">
                <div className="BCvideoContainer">
                    {!isVideoPlaying ? (
                        <div className="BCvideoPreview" onClick={handleVideoClick}>
                            <div className="BCvideoThumbnail">
                                <div className="BCplayButton">
                                    <Play size={60} fill="white" />
                                </div>
                                <div className="BCvideoOverlay">
                                    <h2>관리자 대시보드로 손쉽게 관리하기</h2>
                                    <p>시스템 현황과 사용자 관리 기능을 한눈에 확인하세요</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="BCactiveVideo" onClick={handleVideoClick}>
                            <div className="BCvideoPlayer">
                                <video autoPlay loop muted className='BCvideoPreview' src='media/admin.mp4' alt="Video Preview" />
                            </div>
                        </div>
                    )}
                </div>
            </section>


            {/* Features Section */}
            <section className="BCfeaturesSection">
                <div className="BCsectionTitle">
                    <h2>관리자 주요 기능</h2>
                    <p>운영자가 시스템을 효율적으로 관리할 수 있도록 제공되는 핵심 기능</p>
                </div>

                <div className="BCfeaturesGrid">
                    {features.map((feature, index) => (
                        <div key={index} className="BCfeatureCard">
                            <div className="BCfeatureIcon" style={{ color: feature.color }}>
                                {feature.icon}
                            </div>
                            <h3>{feature.title}</h3>
                            <h4>{feature.subtitle}</h4>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="BCctaSection">
                <button className="BCctaButton"
                    onClick={() => window.scroll(0, 0)}>
                    처음으로 돌아가기
                    <ChevronRight size={20} />
                </button>
            </section>
        </div>
    );
};
