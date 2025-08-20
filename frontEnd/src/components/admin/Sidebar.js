// Sidebar.js
import React from 'react';
import styled from 'styled-components';
import { Crown, PieChart, Users, Mail, Calendar, MessageCircle, BarChart3, Settings, LogOut } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 40;
`;

const Aside = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
  width: 18rem;
  height: 100%;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to right, #4f46e5, #a855f7);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Nav = styled.nav`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  width: 100%;
  font-weight: 500;
  background: ${({ active }) => (active ? 'linear-gradient(to right, #6366f1, #a855f7)' : 'transparent')};
  color: ${({ active }) => (active ? 'white' : '#4b5563')};
  cursor: pointer;
  &:hover {
    background: ${({ active }) => (active ? undefined : '#f9fafb')};
    color: ${({ active }) => (active ? undefined : '#6366f1')};
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  color: #dc2626;
  width: 100%;
  font-weight: 500;
  background: transparent;
  cursor: pointer;
  &:hover {
    background: #fee2e2;
  }
`;

const Sidebar = ({ currentPage, onPageChange, isOpen, onToggle, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: PieChart },
    { id: 'users', label: '사용자 관리', icon: Users },
    { id: 'inquiries', label: '1:1 문의 관리', icon: Mail },
    { id: 'festivals', label: '축제 관리', icon: Calendar },
    { id: 'chat', label: '채팅방 관리', icon: MessageCircle },
    { id: 'reports', label: '통계 및 리포트', icon: BarChart3 },
    { id: 'settings', label: '시스템 설정', icon: Settings }
  ];

  return (
    <>
      {isOpen && <Overlay onClick={onToggle} />}
      <Aside isOpen={isOpen}>
        <Header>
          <Crown size={24} />
          <h1>Admin Panel</h1>
        </Header>
        <Nav>
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <NavButton
                key={item.id}
                active={currentPage === item.id}
                onClick={() => onPageChange(item.id)}
              >
                <Icon size={16} />
                {item.label}
              </NavButton>
            );
          })}
        </Nav>
        <div style={{ padding: '1rem' }}>
          <LogoutButton onClick={onLogout}>
            <LogOut size={16}  />
            로그아웃
          </LogoutButton>
        </div>
      </Aside>
    </>
  );
};

export default Sidebar;
