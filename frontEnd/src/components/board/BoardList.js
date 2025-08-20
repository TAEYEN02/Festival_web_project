import { useState } from "react";
import { useParams } from "react-router-dom"
import { ArrowUpDown } from 'lucide-react'
import './BoardList.css'

export const BoardList = () => {

    // 게시판 주제 가져오기
    const { categoryId } = useParams();
    const boardCategories = [
        { id: 0, name: '전체', emoji: '🌍' },
        { id: 1, name: '잡담', emoji: '💬' },
        { id: 2, name: '질문', emoji: '❓' },
    ];

    // useState 대신 categoryId로 직접 필터링
    const currentCategory = boardCategories.find(cat => cat.id == categoryId);
    const activeTab = currentCategory?.name || '전체';

    const posts = [
        {
            id: 1,
            category: '잡담',
            title: '브라질 카니발 직접 다녀왔어요! 🇧🇷',
            content: '리우 카니발 정말 대박이었어요... 평생 잊지 못할 경험이었습니다.',
            author: 'festival_lover',
            avatar: '🎭',
            date: '2시간 전',
            likes: 47,
            comments: 12,
            location: '리우데자네이루, 브라질',
            images: ['/festival/festival1.jpg'],
            tags: ['카니발', '브라질', '여행후기'],
            user: 1
        },
        {
            id: 2,
            category: '질문',
            title: '10월에 옥토버페스트 가려는데 팁 있나요?',
            content: '독일 뮌헨 옥토버페스트 처음 가는데 꼭 알아야 할 것들이 있을까요?',
            author: 'beer_enthusiast',
            avatar: '🍺',
            date: '5시간 전',
            likes: 23,
            comments: 8,
            location: '뮌헨, 독일',
            images: ['/festival/festival2.jpg'],
            tags: ['옥토버페스트', '독일', '맥주축제'],
            user: 1
        },
        {
            id: 3,
            category: '잡담',
            title: '일본 벚꽃축제 시즌이 그리워요 🌸',
            content: '도쿄 우에노 공원에서 본 벚꽃이 아직도 눈에 선해요...',
            author: 'sakura_dreamer',
            avatar: '🌸',
            date: '1일 전',
            likes: 89,
            comments: 24,
            location: '도쿄, 일본',
            images: ['/festival/festival3.jpg'],
            tags: ['벚꽃축제', '일본', '도쿄'],
            user: 1
        },
        {
            id: 4,
            category: '질문',
            title: '인도 홀리 축제 안전하게 즐기는 방법?',
            content: '홀리 축제에 참여하고 싶은데 주의사항이나 준비물이 있을까요?',
            author: 'color_traveler',
            avatar: '🎨',
            date: '2일 전',
            likes: 34,
            comments: 15,
            location: '델리, 인도',
            images: ['/festival/festival4.jpg'],
            tags: ['홀리축제', '인도', '색깔축제'],
            user: 1
        },
        {
            id: 5,
            category: '잡담',
            title: '스페인 토마토 축제 La Tomatina 체험기',
            content: '부뇰에서 열린 토마토 전쟁! 정말 미친 경험이었어요 ㅋㅋㅋ',
            author: 'tomato_warrior',
            avatar: '🍅',
            date: '3일 전',
            likes: 156,
            comments: 31,
            location: '부뇰, 스페인',
            images: ['/festival/festival5.jpg'],
            tags: ['라토마티나', '스페인', '토마토축제'],
            user: 1
        },
    ];

    const filteredPosts = activeTab === '전체'
        ? posts
        : posts.filter(post => post.category === activeTab);

    const getBLCategoryClass = (category) => {
        switch (category) {
            case '잡담': return 'BLcategorychat';
            case '질문': return 'BLcategoryinquiry';
            default: return 'BLcategorydefault';
        }
    };

    return (
        <div className={`BLappcontainer ${categoryId === '1' ? 'BLchatbg' :
            categoryId === '2' ? 'BLinquirybg' : 'BLtotalbg'
            }`}>

            {/* Posts List */}
            <main className="BLmaincontent">
                <div className="BLpostscontainer">
                    <div className="BLpostsheader">
                        <div className="BLheaderrow">
                            <div className="BLcolumncategory">분류</div>
                            <div className="BLcolumntitle">제목<ArrowUpDown size={14} /></div>
                            <div className="BLcolumnauthor">작성자<ArrowUpDown size={14} /></div>
                            <div className="BLcolumndate">작성일<ArrowUpDown size={14} /></div>
                            <div className="BLcolumnstats">추천<ArrowUpDown size={14} /></div>
                            <div className="BLcolumnstats">댓글<ArrowUpDown size={14} /></div>
                        </div>
                    </div>

                    <div className="BLpostslist">
                        {filteredPosts.map((post) => (
                            <div
                                key={post.id}
                                className="BLpostrow"
                                onClick={() => {
                                    window.location.href = `/board/${categoryId}/detail/${post.id}`
                                }}
                            >
                                <div className="BLrowcategory">
                                    <span className={`BLcategorybadge ${getBLCategoryClass(post.category)}`}>
                                        {post.category}
                                    </span>
                                </div>

                                <div className="BLrowtitle">
                                    <div className="BLtitlecontent">
                                        <span className="BLtitletext">{post.title}</span>
                                    </div>
                                    <div className="BLtitlepreview">{post.content}</div>
                                    <div className="BLtagscontainer">
                                        {post.tags.slice(0, 3).map((tag, index) => (
                                            <span key={index} className="BLtag">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    {/* 모바일용 추가 정보 */}
                                    <div className="BLmobileinfo">
                                        <div className="BLmobileauthor">
                                            <span>{post.avatar}</span>
                                            <span>{post.author}</span>
                                            <span>•</span>
                                            <span>{post.date}</span>
                                        </div>
                                        <div className="BLmobilestats">
                                            <span>❤️ {post.likes}</span>
                                        </div>
                                        <div className="BLmobilestats">

                                            <span>💬 {post.comments}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="BLrowauthor">
                                    <div className="BLauthorinfo">
                                        <span className="BLauthoravatar">{post.avatar}</span>
                                        <span className="BLauthorname">{post.author}</span>
                                    </div>
                                </div>

                                <div className="BLrowdate">
                                    <span>{post.date}</span>
                                    {post.location && (
                                        <div className="BLlocation">
                                            <span className="BLlocationicon">📍</span>
                                            <span>{post.location}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="BLrowstats">
                                    <div className="BLstatsitem">
                                        <span className="BLstatsicon">❤️</span>
                                        <span>{post.likes}</span>
                                    </div>

                                </div>

                                <div className="BLrowstats">

                                    <div className="BLstatsitem">
                                        <span className="BLstatsicon">💬</span>
                                        <span>{post.comments}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Load More Button */}
                <div className="BLloadmoresection">
                    <button className="BLloadmorebtn">
                        더 많은 축제 이야기 보기 🎊
                    </button>
                </div>
            </main>

            {/* Floating Action Button */}
            {categoryId !== '0' && <button
                onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `${categoryId}/write`
                }}
                className="BLfloatingbtn">
                ✨
            </button>}
        </div>
    )
}