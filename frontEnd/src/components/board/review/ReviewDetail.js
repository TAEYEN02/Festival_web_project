import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquareText, Heart, Share, NotebookPen, Trash } from 'lucide-react'
import { useEffect, useState } from 'react';
import { reviewCommentDelete, reviewCommentUpdate, reviewCommentWrite, reviewDelete, reviewFindOne, reviewLikeToggle } from '../../../api/review';
import Swal from 'sweetalert2';
import './ReviewDetail.css';
import { useAuth } from '../../../context/AuthContext';

export const ReviewDetail = () => {
    const { reviewId } = useParams()
    const [post, setPost] = useState();
    const navigate = useNavigate();
    const userId = Number(localStorage.getItem('userId'));
    const [edit, setEdit] = useState();
    const { user } = useAuth();

    //댓글 작성용
    const [formData, setFormData] = useState({
        reviewId: Number(reviewId),
        userId: userId,
        content: '',
        parentId: ''
    });

    //댓글 수정용
    const [editData, setEditData] = useState({
        reviewId: Number(reviewId),
        userId: userId,
        content: '',
        parentId: ''
    });


    // [Get]데이터 로드
    useEffect(() => {
        reviewFindOne(reviewId)
            .then(response => {
                setPost(response)
            })
    }, [])


    // [POST]좋아요
    const reviewLikeHandler = async () => {
        reviewLikeToggle(reviewId, userId)
            .then(response => {
                // console.log(response)
                setPost(response)
            })
    }

    //공유
    const reviewShareHandler = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            await Swal.fire({
                title: '성공',
                text: "링크가 복사되었습니다!",
                showConfirmButton: true
            })
        } catch (err) {
            console.error("링크 복사 실패", err);
        }
    }

    // [Delete]게시물 삭제
    const reviewDeleteHandler = async () => {
        try {
            const result = await Swal.fire({
                title: "게시판 삭제",
                text: "정말로 삭제하시겠습니까?",
                showCancelButton: true,
                confirmButtonText: "삭제",
                cancelButtonText: "취소"
            });

            if (result.isConfirmed) {
                reviewDelete(Number(reviewId), userId)
                const response = await Swal.fire({
                    title: "성공",
                    text: "삭제에 성공하였습니다",
                    showConfirmButton: true
                })
                if (response.isConfirmed) navigate(-1)
            } else {
                return
            }

        } catch (error) {
            console.log(error)
        }
    }



    // [POST]댓글 작성
    const reviewCommentWriteHandler = () => {
        reviewCommentWrite(formData)

        // navigate(0);
    }

    // [UPDATE]댓글 수정
    const reviewCommentUpdateHandler = (commentId) => {

        reviewCommentUpdate(editData, commentId)
            .then(response => {
                setPost(prevPost => {
                    const updatedComments = prevPost.comments.map(c =>
                        c.id === commentId ? response : c
                    );
                    return { ...prevPost, comments: updatedComments };
                });
                setEdit(null);
            })
            .catch(error => {
                console.error(error);
                Swal.fire({
                    icon: "error",
                    title: "오류",
                    text: "댓글 수정 중 오류가 발생했습니다."
                });
            });

    }

    // [DELETE]댓글 삭제
    const reviewCommentDeleteHandler = async (commentId) => {

        const response = await Swal.fire({
            text: '정말 댓글을 삭제 하시겠습니까?',
            showCancelButton: true,
            confirmButtonText: '예',
            cancelButtonText: '아니요'
        })

        if (response.isConfirmed) {
            reviewCommentDelete(commentId)
        }

        // navigate(0);
    }

    if (!post) return <div className="RDempty">게시물이 없습니다.</div>;

    return (
        <div className={`RDcontainer`}>
            {/* Header */}
            <header className="RDheader" />

            {/* Post Detail */}
            <main className="RDmain">
                <article className="RDpost">
                    {/* Post Header */}
                    <div className="RDpost-header">
                        <div className="RDauthor-section">
                            <div className="RDavatar">
                                <img className="RDavatar" src={post?.authorImg || '/default-profile.png'} />
                            </div>
                            <div className="RDauthor-info">
                                <div className="RDauthor-name-category">
                                    <h3 className="RDauthor-name">{post?.author}</h3>
                                    <span className={`RDcategory RDinquiry`}>리뷰</span>
                                </div>
                                <div className="RDlocation-date">
                                    <span>📍 {post?.location || ''}</span>
                                    <span>•</span>
                                    <span>📅 {post?.date}</span>
                                    <span>•</span>
                                    <span>📅 {post?.createdAt.slice(0, 10)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Post Content */}
                    <h2 className="RDtitle">{post?.title}</h2><br /><br />
                    <p className="RDcontent">{post?.content}</p>

                    {/* Tags */}
                    <div className="RDtags">
                        {post?.tags.map((tag, idx) => (
                            <span key={idx} className="RDtag">#{tag}</span>
                        ))}
                    </div>

                    {/* Images */}
                    {post?.images && post?.images.map((img, idx) => (
                        <div key={idx} className="RDimage-wrapper">
                            <img src={img} alt={`Festival ${idx + 1}`} className="RDimage" />
                        </div>
                    ))}

                    {/* Post Actions */}
                    <div className="RDactions">
                        <div className="RDactions-buttons">
                            <button className="RDaction-btn"><Heart/> {post?.likes}</button>
                            <button className="RDaction-btn"><MessageSquareText /> {post?.comments.length}</button>
                            <button className="RDaction-btn"><Share/> 공유</button>
                        </div>
                        {/* <span className="RDviews">👥 조회 {post.view}</span> */}
                    </div>


                    {/* 댓글 섹션*/}
                    <section className="RDcommentsection">
                        <h2 className="RDcommentheading"><MessageSquareText />댓글 <span className="RDcommentcount">{post.comments ? post.comments.length : 0}</span></h2>
                        <div className="RDcommentform">
                            {/* 댓글 입력 폼 */}
                            <textarea value={formData.content} onChange={(e) => { setFormData((prev) => ({ ...prev, content: e.target.value })) }} className="RDcommenttextarea" placeholder="댓글을 입력하세요..."></textarea>
                            <button onClick={() => reviewCommentWriteHandler()} className="RDcommentsubmitbtn">등록</button>
                        </div>
                        {/* 댓글 보여주기 */}
                        <div className="RDcommentlist">
                            {post.comments && post.comments.length > 0 ? (
                                post.comments.map(comment => (
                                    <div key={comment.id} className="RDcommentitem">
                                        {edit === comment.id ?
                                            //수정모드
                                            <div>
                                                <textarea
                                                    value={editData.content ? editData.content : comment.content}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                                                    className='RDcommenttextarea'
                                                />
                                                <button onClick={() => {
                                                    reviewCommentUpdateHandler(comment.id);
                                                    setEdit(null);
                                                }}
                                                    className="RDcommenteditbtn"
                                                >저장</button>
                                                <button onClick={() => setEdit(null)}
                                                    className="RDcommentdeletebtn"
                                                >취소</button>
                                            </div>
                                            : <div className="RDcommentheader">
                                                <img src={comment.userImg || '/default-profile.png'} alt="프로필" className="RDcommentavatar" />
                                                <span className={comment.userNickname === '관리자' ? 'RDcommentnicknameadmin' : 'RDcommentnickname'}>{comment.userNickname}</span>
                                                <span className="RDcommentcontent">{comment.content}</span>
                                                <div>
                                                    <span className="RDcommentdate">{comment.createdAt.slice(0, 10)}/{comment.createdAt.slice(11, 16)}</span>
                                                    {(comment.authorNickname === user?.username || userId === 1) && <div className="RDcommentactions">
                                                        <button className="RDcommenteditbtn"
                                                            onClick={() => setEdit(comment.id)}>수정</button>
                                                        <button className="RDcommentdeletebtn"
                                                            onClick={() => reviewCommentDeleteHandler(comment.id)}>삭제</button>
                                                    </div>}
                                                </div>
                                            </div>}


                                        {/* 대댓글 */}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <div className="RDcommentreplies">
                                                {comment.replies.map(reply => (
                                                    <div key={reply.id} className="RDreplyitem">
                                                        <div className="RDcommentheader">
                                                            <img src={reply.userImg || '/default-profile.png'} alt="프로필" className="RDcommentavatar" />
                                                            <span className={comment.userNickname === '관리자' ? 'RDcommentnicknameadmin' : 'RDcommentnickname'}>{reply.userNickname}</span>
                                                            <span className="RDcommentdate">{reply.createdAt.slice(0, 10)}</span>
                                                            <span className="RDcommentcontent">{reply.content}</span>
                                                        </div>

                                                    </div>

                                                )).reverse()}
                                            </div>
                                        )}
                                    </div>
                                )).reverse()
                            ) : (
                                <div className="RDnocomments">아직 댓글이 없습니다.</div>
                            )}


                        </div>

                    </section>
                </article>
            </main>
        </div>
    );
};