import { useState } from 'react';
import { Play, MessageCircle, MapPin, Star, ChevronRight } from 'lucide-react';
import './BoardComponent.css';

const BoardComponent = () => {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    const handleVideoClick = () => {
        setIsVideoPlaying(true);
    };

    const features = [
        {
            icon: <MessageCircle size={40} />,
            title: '자유로운 소통',
            subtitle: '전체 • 잡담 • 질문 게시판',
            description: '축제에 대한 모든 이야기를 자유롭게 나누세요. 후기부터 궁금한 점까지 무엇이든 물어보세요.',
            color: '#ff6b6b'
        },
        {
            icon: <MapPin size={40} />,
            title: '지역별 채팅',
            subtitle: '실시간 지역 소통',
            description: '같은 지역 축제를 즐기는 사람들과 실시간으로 소통하며 함께 축제를 만끽해보세요.',
            color: '#4ecdc4'
        },
        {
            icon: <Star size={40} />,
            title: '생생한 리뷰',
            subtitle: '인스타그램 스타일',
            description: '축제 현장의 생생한 사진과 리뷰를 인스타그램처럼 예쁘게 공유해보세요.',
            color: '#45b7d1'
        },
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
                                    <h2>축제 커뮤니티와 함께하세요</h2>
                                    <p>전국 축제 정보와 생생한 후기를 만나보세요</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="BCactiveVideo">
                            <div className="BCvideoPlayer">
                                <video autoPlay loop muted className='BCvideoPreview' src='media/board.mp4' alt="Video Preview" />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="BCfeaturesSection">
                <div className="BCsectionTitle">
                    <h2>커뮤니티 주요 기능</h2>
                    <p>축제를 더욱 즐겁게 만드는 다양한 소통 방식</p>
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
                <button className="BCctaButton">
                    처음으로 돌아가기
                    <ChevronRight size={20} />
                </button>
            </section>
        </div>
    );
};

export default BoardComponent;