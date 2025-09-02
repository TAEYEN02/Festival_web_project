import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import './BoardNavbar.css'

//게시판 상단의 주제 선택 버튼
export const BoardNavBar = () => {
    const navigate = useNavigate();
    const { categoryId } = useParams();
    
    // 기본 카테고리와 특별 카테고리로 분리
    const mainCategories = [
        { id: 0, name: '전체'},
        { id: 1, name: '잡담'},
        { id: 2, name: '질문'},
    ];
    
    const specialCategories = [
        { id: 3, name: '지역'},
        { id: 'review', name: '리뷰'},
    ];
    
    const allCategories = [...mainCategories, ...specialCategories];
    const [activeTab, setActiveTab] = useState(allCategories.find(cat => cat.id == categoryId)?.name || '전체');

    return (
        <header className="BNheader">
            <div className="BNheader-content">
                <div className="BNheader-main">
                    <div className="BNheader-badge">
                        <nav className="BNboard-nav">
                            <div className="BNnav-content">
                                <div className="BNnav-tabs">
                                    {/* 메인 카테고리 */}
                                    <div className="BNnav-main-group">
                                        {mainCategories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => {
                                                    setActiveTab(category.name)
                                                    navigate(`/board/${category.id}`)
                                                }}
                                                className={`BNnav-tab ${activeTab === category.name ? 'BNnav-tab-active' : ''}`}
                                            >
                                                <span>{category.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {/* 구분선 */}
                                    <div className="BNnav-divider"></div>
                                    
                                    {/* 특별 카테고리 */}
                                    <div className="BNnav-special-group">
                                        {specialCategories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => {
                                                    setActiveTab(category.name)
                                                    navigate(category.id===3?`/board/local`:`/board/${category.id}`)
                                                }}
                                                className={`BNnav-tab BNnav-tab-special ${activeTab === category.name ? 'BNnav-tab-active BNnav-tab-special-active' : ''}`}
                                            >
                                                <span>{category.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    )
}