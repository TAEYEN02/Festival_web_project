import { useParams } from 'react-router-dom';
import './BoardDetail.css';

export const BoardDetail = () => {
    const { categoryId, boardId } = useParams();
    console.log('categoryId', categoryId);
    console.log('boardId', boardId);

    // 예시 데이터 (이미지 배열 제거)
    const post = {
        id: 1,
        category: '잡담',
        title: '브라질 카니발 직접 다녀왔어요! 🇧🇷',
        content: '리우 카니발 정말 대박이었어요... 평생 잊지 못할 경험이었습니다. '.repeat(10),
        author: 'festival_lover',
        date: '2023.10.27',
        likes: 47,
        comments: 12,
        views: 152,
        tags: ['카니발', '브라질', '여행후기'],
        user: 1
    };

    const getBLCategoryClass = (category) => {
        switch (category) {
            case '잡담': return 'BLcategorychat';
            case '질문': return 'BLcategoryinquiry';
            default: return 'BLcategorydefault';
        }
    };

    // if (!post) return <div className="BDloadingmessage">게시물을 불러오는 중입니다...</div>;

    return (
        <div className="BDboarddetailcontainer">
            <main className="BDboarddetailmain">
                <article className="BDpostcontainer">
                    {/* 게시글 헤더 */}
                    <header className="BDpostheader">
                        <span className={`BDpostcategory ${getBLCategoryClass(post.category)}`} >{post.category}</span>
                        <h1 className="BDposttitle">{post.title}</h1>
                        <div className="BDpostmetainfo">
                            <span className="BDpostauthor">{post.author}</span>
                            <span className="BDinfodivider">|</span>
                            <span className="BDpostdate">{post.date}</span>
                            <span className="BDinfodivider">|</span>
                            <span className="BDpostviews">조회 {post.views}</span>
                        </div>
                    </header>

                    {/* 구분선 */}
                    <hr className="BDpostdivider" />

                    {/* 게시글 본문 */}
                    <section className="BDpostcontent">
                        <p>{post.content}</p>
                    </section>

                    {/* 태그 */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="BDposttags">
                            {post.tags.map((tag, idx) => (
                                <span key={idx} className="BDtag">#{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* 추천 및 공유 버튼 */}
                    <footer className="BDpostfooter">
                        <div className="BDpostactions">
                            <button className="BDactionbtn BDlikebtn">
                                ❤️ <span>좋아요</span>
                                <span className="BDcount">{post.likes}</span>
                            </button>
                            <button className="BDactionbtn BDsharebtn">
                                📤 <span>공유하기</span>
                            </button>
                        </div>
                    </footer>
                </article>

                {/* 댓글 섹션 (추후 구현) */}
                <section className="BDcommentsection">
                    <h2 className="BDcommentheading">댓글 <span className="BDcommentcount">{post.comments}</span></h2>
                    <div className="BDcommentform">
                        {/* 댓글 입력 폼 */}
                        <textarea className="BDcommenttextarea" placeholder="댓글을 입력하세요..."></textarea>
                        <button className="BDcommentsubmitbtn">등록</button>
                    </div>
                    <div className="BDcommentlist">
                        {/* 댓글 목록 */}
                        <p className="BDnocomments">아직 댓글이 없습니다.</p>
                    </div>
                </section>
            </main>
        </div>
    );
};

