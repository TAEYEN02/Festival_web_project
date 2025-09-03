// import { BASE_URL } from "./baseUrl";
// import DOMPurify from "dompurify";

// const API_URL = `${BASE_URL}/api/review`;
// const token = localStorage.getItem('token')

// //작성
// export const reviewWrite = async (dto, userId) => {

//     const option = {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify(dto)
//     }

//     try {
//         const response = await fetch(`${API_URL}?userId=${userId}`, option)
//         const result = await response.json();
//         return result;

//     } catch (error) {
//         console.log(error)
//         throw new Error("[Write]서버 요청 중 오류 발생")
//     }
// }


// //삭제
// export const reviewDelete = async (reviewId, userId) => {

//     const option = {
//         method: "DELETE",
//         headers: {
//             "Authorization": `Bearer ${token}`
//         },
//     }

//     try {
//         const response = await fetch(`${API_URL}/${reviewId}?userId=${userId}`, option);
//         const result = await response.json();
//         return result;
//     } catch (error) {
//         console.log(error)
//         throw new Error("[Delete]서버 요청 중 오류 발생")
//     }
// }


// //수정
// export const reviewUpdate = async (dto, userId) => {

//     const option = {
//         method: "PUT",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify(dto)
//     }

//     try {
//         const response = await fetch(`${API_URL}?userId=${userId}`, option)
//         const result = await response.json();
//         return result;
//     } catch (error) {
//         console.log(error)
//         throw new Error("[Update]서버 요청 중 오류 발생")
//     }
// }

// //불러오기(전체)
// export const reviewFindALL = async (userId) => {

//     let response;
//     const option = {
//         method: "GET",
//         headers: {
//             "Authorization": `Bearer ${token}`
//         },
//     }

//     try {
//         if (userId) {
//             response = await fetch(`${API_URL}?userId=${userId}`, option)
//         } else {
//             response = await fetch(`${API_URL}`, option)
//         }
//         const result = await response.json();
//         return result;
//     } catch (error) {
//         console.log(error)
//         throw new Error("[Find]서버 요청 중 오류 발생")
//     }
// }

// //불러오기(한개,상세)
// export const reviewFindOne = async (reviewId, userId) => {

//     const option = {
//         method: "GET",
//         headers: {
//             "Authorization": `Bearer ${token}`
//         },
//     }

//     try {
//         let response;
//         if (userId) {
//             response = await fetch(`${API_URL}/${reviewId}?userId=${userId}`, option)
//         } else {
//             response = await fetch(`${API_URL}/${reviewId}`, option)
//         }
//         const result = await response.json();
//         return result;

//     } catch (error) {
//         console.log(error)
//         throw new Error("[Find]서버 요청 중 오류 발생")
//     }
// }


// //좋아요
// export const reviewLikeToggle = async (reviewId, userId) => {

//     const option = {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`
//         },
//     }

//     try {
//         let response = await fetch(`${API_URL}/${reviewId}/like?userId=${userId}`, option)
//         const result = await response.json();
//         return result;
//     } catch (error) {
//         console.log(error)
//         throw new Error("[Like]서버 요청 중 오류 발생")
//     }
// }


// //html 태그 정제
// export const PostContent = (content) => {
//     const clean = DOMPurify.sanitize(content);
//     return <div dangerouslySetInnerHTML={{ __html: clean }} />;
// }


// /////////////////////////////////////////////////////////////////////////////////////////////////
// export const reviewCommentWrite = async (dto) => {

//     const option = {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify(dto)
//     }

//     try {
//         const response = await fetch(`${API_URL}/comment`, option);
//         const result = await response.json();
//         return result;
//     } catch (error) {
//         console.log(error)
//         throw new Error("[Comment]서버 요청 중 오류 발생")
//     }
// }

// //댓글 수정
// export const reviewCommentUpdate = async (dto, commentId) => {

//     const option = {
//         method: "PUT",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify(dto)
//     }

//     try {
//         const response = await fetch(`${API_URL}/comment/${commentId}`, option);
//         const result = await response.json();
//         return result;
//     } catch (error) {
//         console.log(error)
//         throw new Error("[Comment-update]서버 요청 중 오류 발생")
//     }
// }

// //댓글 삭제
// export const reviewCommentDelete = async (commentId) => {

//     const option = {
//         method: "DELETE",
//         headers: {
//             "Authorization": `Bearer ${token}`
//         },
//     }

//     try {
//         const response = await fetch(`${API_URL}/comment/${commentId}`,option)
//         const result = await response.json();
//         return result;
//     } catch (error) {
//         console.log(error)
//         throw new Error("[Comment-delete]서버 요청 중 오류 발생")
//     }
// }

