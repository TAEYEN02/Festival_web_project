import { useState } from 'react';
import { Play, MessageCircle, MapPin, Star, ChevronRight, KeyRound, UserPlus, LogIn } from 'lucide-react';
import '../board/BoardComponent.css';

export const AuthPage = () => {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isVideoPlaying2, setIsVideoPlaying2] = useState(false);

    const handleVideoClick = () => {
        setIsVideoPlaying(!isVideoPlaying);
    };

    const handleVideo2Click = () => {
        setIsVideoPlaying2(!isVideoPlaying2);
    };

    const features = [
        {
            icon: <LogIn size={40} />,
            title: '로그인',
            subtitle: '일반 로그인 + 소셜 로그인',
            description: '아이디와 비밀번호로 로그인하거나, 카카오톡 및 구글 계정을 이용한 간편 로그인을 지원합니다.',
            color: '#4ecdc4'
        },
        {
            icon: <UserPlus size={40} />,
            title: '회원가입',
            subtitle: '간단한 가입 절차',
            description: '이메일과 비밀번호만으로 간단하게 회원가입할 수 있습니다.',
            color: '#45b7d1'
        },
        {
            icon: <MessageCircle size={40} />,
            title: '아이디 찾기',
            subtitle: '이메일 인증 기반',
            description: '가입 시 사용한 이메일을 입력하면 해당 이메일로 가입된 아이디를 반환합니다.',
            color: '#ff6b6b'
        },
        {
            icon: <KeyRound size={40} />,
            title: '비밀번호 찾기',
            subtitle: '임시 비밀번호 발급',
            description: '보안상 비밀번호는 직접 보여주지 않고, 가입된 이메일로 임시 비밀번호를 발급합니다.',
            color: '#f9a825'
        }
    ];

    return (
        <div className="BCcontainer">
            {/* Hero Section - 로그인/회원가입 */}
            <section className="BCheroSection" style={{ paddingBottom: '0px' }}>
                <div className="BCvideoContainer">
                    {!isVideoPlaying ? (
                        <div className="BCvideoPreview" onClick={handleVideoClick}>
                            <div className="BCvideoThumbnail">
                                <div className="BCplayButton">
                                    <Play size={60} fill="white" />
                                </div>
                                <div className="BCvideoOverlay">
                                    <h2>로그인 & 회원가입</h2>
                                    <p>아이디/비밀번호 또는 카카오톡, 구글 계정으로 간편하게 로그인하세요</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="BCactiveVideo" onClick={handleVideoClick}>
                            <div className="BCvideoPlayer">
                                <video autoPlay loop muted className='BCvideoPreview' src='media/login.mp4' alt="Login/Signup Video" />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Hero Section - 아이디/비밀번호 찾기 */}
            <section className="BCheroSection" style={{ paddingTop: '0px' }}>
                <div className="BCvideoContainer">
                    {!isVideoPlaying2 ? (
                        <div className="BCvideoPreview" onClick={handleVideo2Click}>
                            <div className="BCvideoThumbnail">
                                <div className="BCplayButton">
                                    <Play size={60} fill="white" />
                                </div>
                                <div className="BCvideoOverlay">
                                    <h2>아이디 & 비밀번호 찾기</h2>
                                    <p>이메일을 통해 아이디를 확인하고, 임시 비밀번호를 발급받을 수 있습니다</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="BCactiveVideo" onClick={handleVideo2Click}>
                            <div className="BCvideoPlayer">
                                <video autoPlay loop muted className='BCvideoPreview' src='media/id_find.mp4' alt="ID/Password Find Video" />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="BCfeaturesSection">
                <div className="BCsectionTitle">
                    <h2>인증 관련 주요 기능</h2>
                    <p>로그인, 회원가입, 아이디 및 비밀번호 찾기 기능을 지원합니다</p>
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
