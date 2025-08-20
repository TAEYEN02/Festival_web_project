import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import './BoardNavbar.css'

//게시판 상단의 주제 선택 버튼
export const BoardNavBar = () => {

    const navigate = useNavigate();
    const { categoryId } = useParams();
    const boardCategories = [
        { id: 0, name: '전체', emoji: '🌍' },
        { id: 1, name: '잡담', emoji: '💬' },
        { id: 2, name: '질문', emoji: '❓' },
        { id: 'review', name: '리뷰', emoji: '⭐' },
    ];
    const [activeTab, setActiveTab] = useState(boardCategories[categoryId]?.name);

    return (
        <header className="BNheader">
            <div className="BNheader-content">
                <div className="BNheader-main">
                    <div className="BNlogo-section">
                        <div className="BNlogo-icon">
                            <span>🎪</span>
                        </div>
                        <div className="BNlogo-text">
                            <h1 className="BNsite-title">Festival World</h1>
                            <p className="BNsite-subtitle">세계의 모든 축제를 만나보세요</p>
                        </div>
                    </div>
                    <div className="BNheader-badge">
                        <nav className="BNboard-nav">
                            <div className="BNnav-content">
                                <div className="BNnav-tabs">
                                    {boardCategories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => {
                                                setActiveTab(category.name)
                                                console.log(category.name)
                                                navigate(`/board/${category.id}`)
                                            }}
                                            className={`BNnav-tab ${activeTab === category.name ? 'BNnav-tab-active' : ''}`}
                                        >
                                            <span>{category.emoji}</span>
                                            <span>{category.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    )
}
