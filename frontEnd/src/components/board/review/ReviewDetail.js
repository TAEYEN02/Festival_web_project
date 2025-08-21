import { useParams } from 'react-router-dom';
import './ReviewDetail.css';

export const ReviewDetail = () => {
    const { reviewId } = useParams()
    console.log('reviewIdId', reviewId)


    // if (!post) return <div className="BDempty">게시물이 없습니다.</div>;
    // 예시
    const post = 
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
            images: ['/festival/festival1.jpg','/festival/festival1.jpg','/festival/festival1.jpg','/festival/festival1.jpg','/festival/festival1.jpg'],
            tags: ['카니발', '브라질', '여행후기'],
            user: 1
        }

    return (
        <div className={`BDcontainer`}>
            {/* Header */}
            <header className="BDheader" />

            {/* Post Detail */}
            <main className="BDmain">
                <article className="BDpost">
                    {/* Post Header */}
                    <div className="BDpost-header">
                        <div className="BDauthor-section">
                            <div className="BDavatar">{post?.avatar}</div>
                            <div className="BDauthor-info">
                                <div className="BDauthor-name-category">
                                    <h3 className="BDauthor-name">{post?.author}</h3>
                                    <span className={`BDcategory ${post?.category === '잡담'
                                        ? 'BDchat'
                                        : post?.category === '문의'
                                            ? 'BDinquiry'
                                            : ''
                                        }`}>{post?.category}</span>
                                </div>
                                <div className="BDlocation-date">
                                    <span>📍 {post?.location||''}</span>
                                    <span>•</span>
                                    <span>📅 {post?.date}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Post Content */}
                    <h2 className="BDtitle">{post?.title}</h2><br/><br/>
                    <p className="BDcontent">{post?.content}</p>

                    {/* Tags */}
                    <div className="BDtags">
                        {post?.tags.map((tag, idx) => (
                            <span key={idx} className="BDtag">#{tag}</span>
                        ))}
                    </div>

                    {/* Images */}
                    {post?.images && post?.images.map((img, idx) => (
                        <div key={idx} className="BDimage-wrapper">
                            <img src={img} alt={`Festival ${idx + 1}`} className="BDimage" />
                        </div>
                    ))}

                    {/* Post Actions */}
                    <div className="BDactions">
                        <div className="BDactions-buttons">
                            <button className="BDaction-btn">❤️ {post?.likes}</button>
                            <button className="BDaction-btn">💬 {post?.comments}</button>
                            <button className="BDaction-btn">📤 공유</button>
                        </div>
                        <span className="BDviews">👥 조회 {Math.floor(Math.random() * 500 + 100)}</span>
                    </div>
                </article>
            </main>
        </div>
    );
};
