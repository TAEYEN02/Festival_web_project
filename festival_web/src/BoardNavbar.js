import {Link, Navigate, Route} from 'react-router-dom'
import { BoardList } from './BoardList'

//게시판 상단의 주제 선택 버튼
export const BoardNavBar = () => {

    return(
        <nav>
            <ul>
                <li><Link to='/board/0'>전체</Link></li>
                <li><Link to='/board/1'>잡담</Link></li>
                <li><Link to='/board/2'>질문</Link></li>
            </ul>
        </nav>
    )
}

//추후 app.js에 합쳐질 예정
const BoardRoute = () => {
    return(
        <>
            <BoardNavBar/>
            <Routes>
                <Route path='/board' element={<Navigate to='/board/0'/>}/>
                <Route path=':boardId' element={<BoardList/>}/>
            </Routes>
        </>
    )
}