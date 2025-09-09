import { Heart, SquarePen } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import './ReviewList.css';
import { useEffect, useState } from 'react';
import { PostContent, reviewFindALL } from '../../../api/review';
import { useAuth } from '../../../context/AuthContext';
import { reviewBase } from '../review/reviewImg';

export const ReviewList = () => {

    const navigate = useNavigate();
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPage, setTotalPage] = useState(1);
    const [size] = useState(10);

    //페이징
    const goPrev = () => {
        setPage(prev => Math.max(prev - 1, 0));
    }

    const goNext = () => {
        setPage(prev => Math.min(prev + 1, totalPage - 1));
    }



    // [Get]데이터 로딩
    useEffect(() => {
        reviewFindALL(page, size)
            .then(response => {
                setTotalPage(response.totalPages)
                setPosts(response.content)
            })
    }, [page, size])

    if (!posts) return <div>로딩중입니다...</div>

    if (posts.length <= 0)
        return (
            <>
                <div>표시할 데이터가 없습니다.</div>
                {/* Floating Action Button */}
                {user && <button
                    onClick={(e) => {
                        //이벤트 전파 방지
                        e.stopPropagation();
                        navigate(`/board/review/write`)
                        window.scroll(0, 0)
                    }}
                    className="floating-btn">
                    <SquarePen />
                </button>}
            </>
        )

    return (
        <div className={`app-container`}>

            {/* Posts List */}
            <main className="main-content">
                <div className="posts-container">
                    {posts?.map((post, index) => (
                        <article key={post.id} className="post-card">
                            {/* Post Header */}
                            <div className="post-header"
                                onClick={(e) => {
                                    //이벤트 전파 방지
                                    e.stopPropagation();
                                    navigate(`/board/review/detail/${post.id}`)
                                    window.scroll(0, 0)
                                }}>
                                <div className="post-author-section">
                                    <div className="author-info">
                                        <div className="author-avatar">
                                            <img className="author-avatar" alt='author-avatar' src={post.authorImg || '/default-profile.png'} />
                                        </div>
                                        <div className="author-details">
                                            <div className="author-name-section">
                                                <h3 className="author-name">{post.authorNickname}</h3>
                                                <span className={`category-badge category-review`}>
                                                    리뷰
                                                </span>
                                            </div>
                                            <div className="post-meta">
                                                {/* MapPin 아이콘 (react-icons: MdLocationOn) */}
                                                <span>{post.location || ''}</span>
                                                <span>•</span>
                                                {/* Calendar 아이콘 (react-icons: MdCalendarToday) */}
                                                <span>축제일자 : {post.date}</span>
                                                <span>•</span>
                                                <span>작성일 : {post.createdAt.slice(0, 10)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Post Content */}
                                <button
                                    onClick={(e) => {
                                        //이벤트 전파 방지
                                        e.stopPropagation();
                                        navigate(`/board/review/detail/${post.id}`)
                                        window.scroll(0, 0)
                                    }}
                                    className="post-title">{post.title}</button>
                                <div className="post-content">{PostContent(post.content)}</div>

                                {/* Tags */}
                                <div className="tags-container">
                                    {post.tags.map((tag, index) => (
                                        <span key={index} className="tag">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* 이미지 */}
                            {post.images && (
                                <div className="post-image-container">
                                    {(post.images?.length > 0 || post.id < 16) && <img
                                        src={post.id <= 15 ? `data:image/png;base64,${reviewBase[index + 1]}` : `data:image/png;base64,${post.images[0]}`}
                                        alt="Festival"
                                        className="post-image"
                                        onClick={(e) => {
                                            //이벤트 전파 방지
                                            e.stopPropagation();
                                            navigate(`/board/review/detail/${post.id}`)
                                            window.scroll(0, 0)
                                        }}
                                    />}
                                </div>
                            )}

                            {/* Post Actions */}
                            <div className="post-actions">
                                <div className="actions-content">
                                    <div className="action-buttons">
                                        <div className="action-btn">
                                            {/* Heart 아이콘 (react-icons: FaHeart) */}
                                            <span className="icon-placeholder"><Heart /></span>
                                            <span>{post.likes}</span>
                                        </div>
                                        {/* <div className="action-btn">
                                            <span className="icon-placeholder"><MessageSquareText /></span>
                                            <span>{post.comments.length}</span>
                                        </div> */}
                                    </div>
                                    <div className="view-count">
                                        {/* Users 아이콘 (react-icons: FaUsers) */}
                                        <span className="icon-placeholder">👥</span>
                                        <span>조회 {post.view}</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    )).reverse()}
                </div>

                {/* 페이징 버튼 */}
                <div className="RLpagination">
                    <button onClick={()=>{
                        goPrev()
                        window.scroll(0,0)
                    }} disabled={page === 0}>이전</button>
                    <span>{page + 1} / {totalPage}</span>
                    <button onClick={()=>{
                        goNext()
                        window.scroll(0,0)
                    }} disabled={page + 1 >= totalPage}>다음</button>
                </div>
            </main>

            {/* Floating Action Button */}
            {user && <button
                onClick={(e) => {
                    //이벤트 전파 방지
                    e.stopPropagation();
                    navigate(`/board/review/write`)
                    window.scroll(0, 0)
                }}
                className="floating-btn">
                <SquarePen />
            </button>}


        </div>
    )
}