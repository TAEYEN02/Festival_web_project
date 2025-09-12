import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { User, Bookmark, MessageSquare, LogOut, Calendar, Users, Camera } from 'lucide-react';
import axios from 'axios';

const SidebarContainer = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  position: sticky;
  top: 1.5rem;
  height: fit-content;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 5rem;
  height: 5rem;
  margin: 0 auto 1rem;
`;

const Avatar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  background: ${props => props.image ? `url(${props.image}) center/cover no-repeat` : 'linear-gradient(to right, #4a4aff)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
`;

const CameraButton = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  border-radius: 50%;
  padding: 0.25rem;
  cursor: pointer;
  border: 1px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f3f4f6;
  }

  input {
    display: none;
  }
`;

const UserInfo = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const UserName = styled.h3`
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-weight: 600;
`;

const UserEmail = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
`;

const MenuButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;

  background: ${props => props.active ? 'linear-gradient(to right,#4a4aff)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#4b5563'};

  &:hover {
    background: ${props => props.active ? '' : '#f9fafb'};
    color: ${props => props.active ? 'white' : '#4a4aff'};
    transform: translateY(-1px);
  }
`;

const MenuNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const JoinInfo = styled.div`
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const LogoutButton = styled.button`
  width: 100%;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  color: #ef4444;
  border: 1px solid #fca5a5;
  background: #fef2f2;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: #fee2e2;
    transform: translateY(-1px);
  }
`;

const MyPageSidebar = ({ currentSection, onSectionChange, isLoggedIn, userData, onLogout, setUserData, token }) => {
  const [preview, setPreview] = useState(userData?.profileImage || null);

  const menuItems = [
    { id: 'profile', label: '프로필 관리', icon: User },
    { id: 'scraps', label: '찜 목록', icon: Bookmark },
    { id: 'inquiries', label: '1:1 문의', icon: MessageSquare },
    // { id: 'regionChat', label: '지역 채팅', icon: Users },
  ];

  console.log("JWT token:", token);


  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 미리보기
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // FormData 생성
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/mypage/profile/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });

      // 서버에서 profileImage 반환 시 맨 앞 / 제거
      const serverPath = response.data.profileImage.replace(/^\/+/, '');
      setUserData(prev => ({ ...prev, profileImage: serverPath }));

      // 안전하게 preview URL 생성
      setPreview(`http://localhost:8081/${serverPath}`);
    } catch (err) {
      console.error(err);
      alert("업로드 실패");
    }
  };

  // useEffect에서 프로필 불러올 때도 안전하게 처리
  useEffect(() => {
    if (!isLoggedIn || !token) return;

    axios.get("/api/mypage/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const cleanPath = res.data.profileImage ? res.data.profileImage.replace(/^\/+/, '') : null;
        setUserData(res.data);
        setPreview(cleanPath ? `http://localhost:8081/${cleanPath}` : null);
      })
      .catch(err => {
        console.error(err);
        alert("프로필 정보를 불러오는 데 실패했습니다.");
      });
  }, [isLoggedIn, token]);


  const getInitial = () => userData?.nickname ? userData.nickname.charAt(0) : userData?.username?.charAt(0) || "?";

  if (!isLoggedIn || !userData) {
    return (
      <SidebarContainer>
        <Avatar>{'?'}</Avatar>
        <UserInfo>
          <UserName>로그인이 필요합니다</UserName>
          <UserEmail>마이페이지 기능을 사용하려면 로그인해주세요.</UserEmail>
        </UserInfo>
      </SidebarContainer>
    );
  }

  const formatJoinDate = (dateString) => new Date(dateString).toLocaleDateString('ko-KR');

  return (
    <SidebarContainer>
      <AvatarWrapper>
        <Avatar image={preview}>{!preview && getInitial()}</Avatar>
        <CameraButton>
          <Camera size={16} />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </CameraButton>
      </AvatarWrapper>

      <UserInfo>
        <UserName>{userData.nickname || userData.username}</UserName>
        <UserEmail>{userData.email}</UserEmail>
      </UserInfo>

      <MenuNav>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <MenuButton
              key={item.id}
              active={isActive}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon size={20} />
              {item.label}
            </MenuButton>
          );
        })}
      </MenuNav>

      <JoinInfo>
        <Calendar size={16} />
        가입일: {formatJoinDate(userData.createdAt)}
      </JoinInfo>

      <LogoutButton onClick={onLogout}>
        <LogOut size={20} />
        로그아웃
      </LogoutButton>
    </SidebarContainer>
  );
};

export default MyPageSidebar;
