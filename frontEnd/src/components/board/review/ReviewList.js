import { MessageSquareText, Heart, SquarePen } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import './ReviewList.css';
import { useEffect, useState } from 'react';
import { reviewFindALL } from '../../../api/review';
import { useAuth } from '../../../context/AuthContext';

export const ReviewList = () => {

    const navigate = useNavigate();
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);

    // [Get]데이터 로딩
    useEffect(() => {
        reviewFindALL()
            .then(response => {
                setPosts(response)
            })
    }, [])

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
                    {posts.map((post) => (
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
                                            <img className="author-avatar" src={post.authorImg || '/default-profile.png'} />
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
                                                <span>{post.date}</span>
                                                <span>•</span>
                                                <span>{post.createdAt.slice(0, 10)}</span>
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
                                <p className="post-content">{post.content}</p>

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
                                    <img
                                        src={post.images[0]}
                                        alt="Festival"
                                        className="post-image"
                                        onClick={(e) => {
                                            //이벤트 전파 방지
                                            e.stopPropagation();
                                            navigate(`/board/review/detail/${post.id}`)
                                            window.scroll(0, 0)
                                        }}
                                    />
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

                {/* Load More Button */}
                <div className="load-more-section">
                    <button className="load-more-btn">
                        더 많은 축제 이야기 보기 🎊
                    </button>
                </div>
            </main>

            {/* Floating Action Button */}
            {console.log(user)}
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