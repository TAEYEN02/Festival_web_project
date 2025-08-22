import React from 'react';
import styled from 'styled-components';
import { User, Bookmark, MessageSquare, LogOut, Calendar, Users } from 'lucide-react';

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

const Avatar = styled.div`
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  background: linear-gradient(to right, #6366f1, #a78bfa);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
  margin: 0 auto 1rem;
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

  background: ${props => props.active ? 'linear-gradient(to right, #6366f1, #a78bfa)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#4b5563'};

  &:hover {
    background: ${props => props.active ? '' : '#f9fafb'};
    color: ${props => props.active ? 'white' : '#6366f1'};
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

const MyPageSidebar = ({ currentSection, onSectionChange, isLoggedIn, userData, onLogout }) => {
  const menuItems = [
    { id: 'profile', label: '프로필 관리', icon: User },
    { id: 'scraps', label: '찜 목록', icon: Bookmark },
    { id: 'inquiries', label: '1:1 문의', icon: MessageSquare },
    { id: 'regionChat', label: '지역 채팅', icon: Users },
  ];

  if (!isLoggedIn || !userData) {
    return (
      <SidebarContainer>
        <div style={{ textAlign: 'center' }}>
          <Avatar>?</Avatar>
          <UserInfo>
            <UserName>로그인이 필요합니다</UserName>
            <UserEmail>마이페이지 기능을 사용하려면 로그인해주세요.</UserEmail>
          </UserInfo>
        </div>
      </SidebarContainer>
    );
  }

  const formatJoinDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getInitial = () => {
    return userData.nickname ?
      userData.nickname.charAt(0) :
      userData.username.charAt(0);
  };

  return (
    <SidebarContainer>
      <UserInfo>
        <Avatar>{getInitial()}</Avatar>
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
            </MenuButton>);
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