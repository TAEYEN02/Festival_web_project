import { Outlet } from "react-router-dom"
import { BoardNavBar } from "./BoardNavbar"

// 게시판 전체적인 레이아웃
export const BoardLayout = () => {
    return(
        <>
            <BoardNavBar/>
            <Outlet/>
        </>
    )
}