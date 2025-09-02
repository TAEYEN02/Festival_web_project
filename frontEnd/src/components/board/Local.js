import { useEffect, useState } from "react"
import RealtimeChat from "../user/RealtimeChat"
import { fetchCurrentUserInfo } from "../../api/user";
import styled from "styled-components";

const MainContainer = styled.div`
    width: 60%;
    justify-content : center;
    align-items : center;
    margin : 0 auto;
    min-height : 100vh;
`

export const Local = () => {

    const [userData,setUserData] = useState('');

    useEffect(()=>{
        const apiConnection = async () => {
            const userInfo = await fetchCurrentUserInfo();
            setUserData(userInfo)
        }
        apiConnection();
    },[])

    if(!userData)return <div>로딩중</div>

    return(
        <MainContainer>
            <RealtimeChat userId={userData.id} userNickname={userData.nickname}/>
        </MainContainer>
    )
}