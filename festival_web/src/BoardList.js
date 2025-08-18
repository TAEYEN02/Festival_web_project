import { useParams } from "react-router-dom"

export const BoardList = () => {

    // 게시판 주제 가져오기
    const {boardId} = useParams();
    const category = {'0':'전체','1':'잡담','2':'질문'}

    return(
        <div>
            {category?.boardId}보드 리스트 입니다.
        </div>
    )
}