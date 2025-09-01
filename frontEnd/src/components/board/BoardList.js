import {MessageSquareText,Heart,SquarePen} from 'lucide-react'
import { useNavigate, useParams } from "react-router-dom"
import { ArrowUpDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { boardFindALL,PostContent } from '../../api/board'
import './BoardList.css'

export const BoardList = () => {

    // 게시판 주제 가져오기
    const { categoryId } = useParams();
    const [posts,setPosts]  = useState([]);
    const navigate = useNavigate();
    const boardCategories = [
        { id: 0, name: '전체'},
        { id: 1, name: '잡담'},
        { id: 2, name: '질문'},
    ];

    // useState 대신 categoryId로 직접 필터링
    const currentCategory = boardCategories.find(cat => cat.id == categoryId);
    const activeTab = currentCategory?.name || '전체';

    useEffect(()=>{
        boardFindALL()
            .then(response => {
                setPosts(response);
            })
    },[])

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

    if(!posts) return<div>데이터 로딩중입니다...</div>

    return (
        <div className='BLappcontainer' >

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
                        {filteredPosts?.map((post) => (
                            <div
                                key={post.id}
                                className="BLpostrow"
                                onClick={() => {
                                    navigate(`/board/${categoryId}/detail/${post.id}`)
                                    window.scroll(0,0)
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
                                    <div className="BLtitlepreview">{PostContent(post.content)}</div>
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
                                            <span>{post.author}</span>
                                            <span>•</span>
                                            <span>{post.date}</span>
                                        </div>
                                        <div className="BLmobilestats">
                                            <span><Heart /> {post.likes}</span>
                                        </div>
                                        <div className="BLmobilestats">

                                            <span><MessageSquareText /> {post.comments ? post.comments.length : 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="BLrowauthor">
                                    <div className="BLauthorinfo">
                                        <span className="BLauthorname">{post.authorNickname}</span>
                                    </div>
                                </div>

                                <div className="BLrowdate">
                                    <span>{post.createdAt.slice(0,10)}</span>
                                </div>

                                <div className="BLrowstats">
                                    <div className="BLstatsitem">
                                        <span className="BLstatsicon"><Heart /></span>
                                        <span>{post.likes}</span>
                                    </div>

                                </div>

                                <div className="BLrowstats">

                                    <div className="BLstatsitem">
                                        <span className="BLstatsicon"><MessageSquareText /></span>
                                        <span>{post.comments ? post.comments.length : 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Load More Button */}
                <div className="BLloadmoresection">
                    <button className="BLloadmorebtn">
                        페이징 버튼(예정)
                    </button>
                </div>
            </main>

            {/* Floating Action Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/board/${categoryId}/write`)
                    window.scroll(0,0)
                }}
                className="BLfloatingbtn">
                <SquarePen />
            </button>
        </div>
    )
}