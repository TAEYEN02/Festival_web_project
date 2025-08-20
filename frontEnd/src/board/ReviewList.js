import './ReviewList.css';

export const ReviewList = () => {

    const posts = [
        {
            id: 6,
            category: '리뷰',
            title: '리우 카니발 후기: 화려함의 극치!',
            content: '리우 카니발에서 느낀 열정과 에너지는 말로 표현할 수 없네요. 춤과 음악, 그리고 사람들의 흥겨움!',
            author: 'carnival_dancer',
            avatar: '💃',
            date: '2일 전',
            likes: 210,
            comments: 42,
            location: '리우데자네이루, 브라질',
            images: ['/festival/festival6.jpg'],
            tags: ['리우카니발', '브라질', '춤'],
            user: 1
        },
        {
            id: 7,
            category: '리뷰',
            title: '독일 옥토버페스트 맥주 체험',
            content: '세계 최대 맥주 축제에서 친구들과 즐긴 맥주와 전통음식! 분위기가 끝내줍니다.',
            author: 'beer_lover',
            avatar: '🍺',
            date: '5일 전',
            likes: 180,
            comments: 28,
            location: '뮌헨, 독일',
            images: ['/festival/festival7.jpg'],
            tags: ['옥토버페스트', '독일', '맥주'],
            user: 1
        },
        {
            id: 8,
            category: '리뷰',
            title: '태국 송크란 축제: 물벼락 대전',
            content: '송크란 축제에서 친구들과 함께 물싸움하며 더위도 날리고 재미도 만끽했어요!',
            author: 'water_fighter',
            avatar: '💦',
            date: '1주일 전',
            likes: 145,
            comments: 36,
            location: '치앙마이, 태국',
            images: ['/festival/festival8.jpg'],
            tags: ['송크란', '태국', '물축제'],
            user: 1
        },
        {
            id: 9,
            category: '리뷰',
            title: '인도 홀리 축제 체험기',
            content: '홀리 축제에서 온몸이 색색의 가루로 뒤덮였지만, 기쁨과 환희가 가득한 하루였어요!',
            author: 'color_explorer',
            avatar: '🌈',
            date: '3일 전',
            likes: 230,
            comments: 50,
            location: '바라나시, 인도',
            images: ['/festival/festival9.jpg'],
            tags: ['홀리', '인도', '색축제'],
            user: 1
        },
        {
            id: 10,
            category: '리뷰',
            title: '일본 삿포로 눈 축제 후기',
            content: '거대한 눈 조각과 빛의 쇼가 정말 장관이었어요. 추운 날씨도 즐거웠습니다!',
            author: 'snow_fan',
            avatar: '❄️',
            date: '4일 전',
            likes: 175,
            comments: 22,
            location: '삿포로, 일본',
            images: ['/festival/festival10.jpg'],
            tags: ['삿포로눈축제', '일본', '눈'],
            user: 1
        }

    ];

    return (
        <div className={`app-container review-bg`}>

            {/* Posts List */}
            <main className="main-content">
                <div className="posts-container">
                    {posts.map((post) => (
                        <article key={post.id} className="post-card">
                            {/* Post Header */}
                            <div className="post-header">
                                <div className="post-author-section">
                                    <div className="author-info">
                                        <div className="author-avatar">
                                            {post.avatar}
                                        </div>
                                        <div className="author-details">
                                            <div className="author-name-section">
                                                <h3 className="author-name">{post.author}</h3>
                                                <span className={`category-badge category-review`}>
                                                    {post.category}
                                                </span>
                                            </div>
                                            <div className="post-meta">
                                                {/* MapPin 아이콘 (react-icons: MdLocationOn) */}
                                                <span className="icon-placeholder">📍</span>
                                                <span>{post.location || ''}</span>
                                                <span>•</span>
                                                {/* Calendar 아이콘 (react-icons: MdCalendarToday) */}
                                                <span className="icon-placeholder">📅</span>
                                                <span>{post.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Post Content */}
                                <button
                                    onClick={(e) => {
                                        //이벤트 전파 방지
                                        e.stopPropagation();
                                        window.location.href = `/board/review/detail/${post.id}`
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
                                            window.location.href = `/board/review/detail/${post.id}`
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
                                            <span className="icon-placeholder">❤️</span>
                                            <span>{post.likes}</span>
                                        </div>
                                        <div className="action-btn">
                                            {/* MessageCircle 아이콘 (react-icons: FaComment) */}
                                            <span className="icon-placeholder">💬</span>
                                            <span>{post.comments}</span>
                                        </div>
                                        <div className="action-btn">
                                            {/* Share2 아이콘 (react-icons: FaShare) */}
                                            <span className="icon-placeholder">📤</span>
                                            <span>공유</span>
                                        </div>
                                    </div>
                                    <div className="view-count">
                                        {/* Users 아이콘 (react-icons: FaUsers) */}
                                        <span className="icon-placeholder">👥</span>
                                        <span>조회 {Math.floor(Math.random() * 500 + 100)}</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Load More Button */}
                <div className="load-more-section">
                    <button className="load-more-btn">
                        더 많은 축제 이야기 보기 🎊
                    </button>
                </div>
            </main>

            {/* Floating Action Button */}
            <button
                onClick={(e) => {
                    //이벤트 전파 방지
                    e.stopPropagation();
                    window.location.href = `review/write`
                }}
                className="floating-btn">
                ✨
            </button>
        </div>
    )
}