import React from 'react';
import styled from 'styled-components';
import { User, Bookmark, MessageSquare, LogOut, Calendar } from 'lucide-react';

const SidebarContainer = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  position: sticky;
  top: 1.5rem;
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

const MenuButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-weight: 500;
  transition: all 0.2s;

  background: ${props => props.active ? 'linear-gradient(to right, #6366f1, #a78bfa)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#4b5563'};

  &:hover {
    background: ${props => props.active ? '' : '#f9fafb'};
    color: ${props => props.active ? 'white' : '#6366f1'};
  }
`;

const MyPageSidebar = ({ currentSection, onSectionChange, isLoggedIn, userData, onLogout }) => {
  const menuItems = [
    { id: 'profile', label: '프로필 관리', icon: User },
    { id: 'scraps', label: '스크랩함', icon: Bookmark },
    { id: 'inquiries', label: '1:1 문의', icon: MessageSquare }
  ];

  if (!isLoggedIn) {
    return (
      <SidebarContainer>
        <div style={{ textAlign: 'center' }}>
          <Avatar>?</Avatar>
          <h3>로그인이 필요합니다</h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>마이페이지 기능을 사용하려면 로그인해주세요.</p>
        </div>
      </SidebarContainer>
    );
  }

  return (
    <SidebarContainer>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <Avatar>{userData.nickname ? userData.nickname.charAt(0) : userData.username.charAt(0)}</Avatar>
        <h3>{userData.nickname || userData.username}</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{userData.email}</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <MenuButton key={item.id} active={isActive} onClick={() => onSectionChange(item.id)}>
              <Icon size={20} />
              {item.label}
            </MenuButton>
          );
        })}
      </nav>

      <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem', fontSize: '0.875rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Calendar size={16} /> 가입일: {new Date(userData.joinDate).toLocaleDateString('ko-KR')}
      </div>

      <button
        onClick={onLogout}
        style={{
          width: '100%',
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          borderRadius: '1rem',
          color: '#ef4444',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <LogOut size={20} /> 로그아웃
      </button>
    </SidebarContainer>
  );
};

export default MyPageSidebar;
