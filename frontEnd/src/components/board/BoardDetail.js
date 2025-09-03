// import { useNavigate, useParams } from 'react-router-dom';
// import { MessageSquareText, Heart, Share, NotebookPen, Trash } from 'lucide-react'
// import { useEffect, useState } from 'react';
// import { boardFindOne, PostContent, boardCommentWrite, boardDelete, boardLikeToggle, boardCommentDelete, boardCommentUpdate } from '../../api/board';
// import Swal from "sweetalert2";
// import './BoardDetail.css';
// import { useAuth } from '../../context/AuthContext';

// export const BoardDetail = () => {
//     const { boardId, categoriId } = useParams();
//     const navigate = useNavigate();
//     const userId = Number(localStorage.getItem('userId'));
//     const [post, setPost] = useState();
//     const [edit, setEdit] = useState();
//     const { user } = useAuth();

//     //댓글 작성용
//     const [formData, setFormData] = useState({
//         boardId: Number(boardId),
//         userId: userId,
//         content: '',
//         parentId: ''
//     });

//     //댓글 수정용
//     const [editData, setEditData] = useState({
//         boardId: Number(boardId),
//         userId: userId,
//         content: '',
//         parentId: ''
//     });

// //     //[GET]데이터 로드
// //     useEffect(() => {
// //         boardFindOne(boardId)
// //             .then(response => {
// //                 setPost(response)
// //                 console.log(response)
// //             })
// //     }, [])

//         const getBLCategoryClass = (category) => {
//             switch (category) {
//                 case '잡담': return 'BLcategorychat';
//                 case '질문': return 'BLcategoryinquiry';
//                 default: return 'BLcategorydefault';
//             }
//         };


//         // [POST]좋아요
//         const boardLikeHandler = async () => {
//             boardLikeToggle(boardId, userId)
//                 .then(response => {
//                     // console.log(response)
//                     setPost(response)
//                 })
//         }

//         //공유
//         const boardShareHandler = async () => {
//             try {
//                 await navigator.clipboard.writeText(window.location.href);
//                 await Swal.fire({
//                     title: '성공',
//                     text: "링크가 복사되었습니다!",
//                     showConfirmButton: true
//                 })
//             } catch (err) {
//                 console.error("링크 복사 실패", err);
//             }
//         }

//         // [Delete]게시물 삭제
//         const boardDeleteHandler = async () => {
//             try {
//                 const result = await Swal.fire({
//                     title: "게시판 삭제",
//                     text: "정말로 삭제하시겠습니까?",
//                     showCancelButton: true,
//                     confirmButtonText: "삭제",
//                     cancelButtonText: "취소"
//                 });

//                 if (result.isConfirmed) {
//                     boardDelete(Number(boardId), userId)
//                     const response = await Swal.fire({
//                         title: "성공",
//                         text: "삭제에 성공하였습니다",
//                         showConfirmButton: true
//                     })
//                     if (response.isConfirmed) navigate(-1)
//                 } else {
//                     return
//                 }

//             } catch (error) {
//                 console.log(error)
//             }
//         }



//     // [POST]댓글 작성
//     const boardCommentWriteHandler = () => {
//         boardCommentWrite(formData)

//         navigate(0);
//     }

//     // [UPDATE]댓글 수정
//     const boardCommentUpdateHandler = (commentId) => {

//         boardCommentUpdate(editData, commentId)
//             .then(response => {
//                 setPost(prevPost => {
//                     const updatedComments = prevPost.comments.map(c =>
//                         c.id === commentId ? response : c
//                     );
//                     return { ...prevPost, comments: updatedComments };
//                 });
//                 setEdit(null);
//             })
//             .catch(error => {
//                 console.error(error);
//                 Swal.fire({
//                     icon: "error",
//                     title: "오류",
//                     text: "댓글 수정 중 오류가 발생했습니다."
//                 });
//             });

//     }

//     // [DELETE]댓글 삭제
//     const boardCommentDeleteHandler = async (commentId) => {

//         const response = await Swal.fire({
//             text: '정말 댓글을 삭제 하시겠습니까?',
//             showCancelButton: true,
//             confirmButtonText: '예',
//             cancelButtonText: '아니요'
//         })

//         if (response.isConfirmed) {
//             boardCommentDelete(commentId)
//         }

//         navigate(0);
//     }

//     if (!post) return <div className="BDloadingmessage">게시물을 불러오는 중입니다...</div>;

//         return (
//             <div className="BDboarddetailcontainer">
//                 <main className="BDboarddetailmain">
//                     <article className="BDpostcontainer">
//                         {/* 게시글 헤더 */}
//                         <header className="BDpostheader">
//                             <span className={`BDpostcategory ${getBLCategoryClass(post.category)}`} >{post.category}</span>
//                             <h1 className="BDposttitle">{post.title}</h1>
//                             <div className="BDpostmetainfo">
//                                 <span className="BDpostauthor">{post.authorNickname}</span>
//                                 <span className="BDinfodivider">|</span>
//                                 <span className="BDpostdate">{post.createdAt.slice(0, 10)}</span>
//                                 <span className="BDinfodivider">|</span>
//                                 <span className="BDpostviews">조회수 {post.view}</span>
//                             </div>
//                         </header>

//                         {/* 구분선 */}
//                         <hr className="BDpostdivider" />

//                         {/* 게시글 본문 */}
//                         <section className="BDpostcontent">
//                             {PostContent(post.content)}
//                         </section>

//                         {/* 태그 */}
//                         {post.tags && post.tags.length > 0 && (
//                             <div className="BDposttags">
//                                 {post.tags.map((tag, idx) => (
//                                     <span key={idx} className="BDtag">#{tag}</span>
//                                 ))}
//                             </div>
//                         )}

//                         {/* 추천 및 공유 버튼 */}
//                         <footer className="BDpostfooter">
//                             <div className="BDpostactions">
//                                 <button className="BDactionbtn BDlikebtn"
//                                     onClick={() => boardLikeHandler()}>
//                                     <Heart /><span>좋아요</span>
//                                     <span className="BDcount">{post.likes}</span>
//                                 </button>
//                                 <button className="BDactionbtn BDsharebtn"
//                                     onClick={() => boardShareHandler()}>
//                                     <Share /> <span>공유하기</span>
//                                 </button>
//                                 {(post.authorNickname === user?.username || userId === 1) && <div>
//                                     <button className="BDactionbtn BDsharebtn"
//                                         onClick={() => navigate(`/board/${categoriId}/update/${boardId}`)}>
//                                         <NotebookPen /> <span>수정하기</span>
//                                     </button>
//                                     <button className="BDactionbtn BDsharebtn"
//                                         onClick={() => boardDeleteHandler()}>
//                                         <Trash /> <span>삭제하기</span>
//                                     </button>
//                                 </div>}
//                             </div>
//                         </footer>
//                     </article>

//     {/* 댓글 섹션*/ }
//     <section className="BDcommentsection">
//         <h2 className="BDcommentheading"><MessageSquareText />댓글 <span className="BDcommentcount">{post.comments ? post.comments.length : 0}</span></h2>
//         <div className="BDcommentform">
//             {/* 댓글 입력 폼 */}
//             <textarea value={formData.content} onChange={(e) => { setFormData((prev) => ({ ...prev, content: e.target.value })) }} className="BDcommenttextarea" placeholder="댓글을 입력하세요..."></textarea>
//             <button onClick={() => boardCommentWriteHandler()} className="BDcommentsubmitbtn">등록</button>
//         </div>
//         {/* 댓글 보여주기 */}
//         <div className="BDcommentlist">
//             {post.comments && post.comments.length > 0 ? (
//                 post.comments.map(comment => (
//                     <div key={comment.id} className="BDcommentitem">
//                         {edit === comment.id ?
//                             //수정모드
//                             <div>
//                                 <textarea
//                                     value={editData.content ? editData.content : comment.content}
//                                     onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
//                                     className='BDcommenttextarea'
//                                 />
//                                 <button onClick={() => {
//                                     boardCommentUpdateHandler(comment.id);
//                                     setEdit(null);
//                                 }}
//                                     className="BDcommenteditbtn"
//                                 >저장</button>
//                                 <button onClick={() => setEdit(null)}
//                                     className="BDcommentdeletebtn"
//                                 >취소</button>
//                             </div>
//                             : <div className="BDcommentheader">
//                                 <img src={comment.userImg || '/default-profile.png'} alt="프로필" className="BDcommentavatar" />
//                                 <span className={comment.userNickname === '관리자' ? 'BDcommentnicknameadmin' : 'BDcommentnickname'}>{comment.userNickname}</span>
//                                 <span className="BDcommentcontent">{comment.content}</span>
//                                 <div>
//                                     <span className="BDcommentdate">{comment.createdAt.slice(0, 10)}/{comment.createdAt.slice(11, 16)}</span>
//                                     {(comment.authorNickname === user?.username || userId === 1) && <div className="BDcommentactions">
//                                         <button className="BDcommenteditbtn"
//                                             onClick={() => setEdit(comment.id)}>수정</button>
//                                         <button className="BDcommentdeletebtn"
//                                             onClick={() => boardCommentDeleteHandler(comment.id)}>삭제</button>
//                                     </div>}
//                                 </div>
//                             </div>}


//                         {/* 대댓글 */}
//                         {comment.replies && comment.replies.length > 0 && (
//                             <div className="BDcommentreplies">
//                                 {comment.replies.map(reply => (
//                                     <div key={reply.id} className="BDreplyitem">
//                                         <div className="BDcommentheader">
//                                             <img src={reply.userImg || '/default-profile.png'} alt="프로필" className="BDcommentavatar" />
//                                             <span className={comment.userNickname === '관리자' ? 'BDcommentnicknameadmin' : 'BDcommentnickname'}>{reply.userNickname}</span>
//                                             <span className="BDcommentdate">{reply.createdAt.slice(0, 10)}</span>
//                                             <span className="BDcommentcontent">{reply.content}</span>
//                                         </div>

//                                     </div>

//                                 )).reverse()}
//                             </div>
//                         )}
//                     </div>
//                 )).reverse()
//             ) : (
//                 <div className="BDnocomments">아직 댓글이 없습니다.</div>
//             )}


//         </div>

//     </section>
//             </main >
//         </div >
//     );
// };

