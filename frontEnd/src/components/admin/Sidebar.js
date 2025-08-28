// src/components/Sidebar.js
import React from 'react';
import styled from 'styled-components';
import { Crown, PieChart, Users, Mail, Calendar, MessageCircle, BarChart3, Settings, LogOut } from 'lucide-react';

const Aside = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
  width: 18rem;
  height: 100%;
  background: white;
  border-right: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0; /* 고정 */
`;

const SidebarTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
`;

const Nav = styled.nav`
  padding: 1.5rem 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;   /* 스크롤 가능 */
  min-height: 0;      /* flexbox overflow 스크롤 해결 */
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 0.5rem;
  width: 100%;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  background: ${({ $active }) => ($active ? '#f3f4f6' : 'transparent')};
  color: ${({ $active }) => ($active ? '#1f2937' : '#6b7280')};

  &:hover {
    background: ${({ $active }) => ($active ? '#f3f4f6' : '#f9fafb')};
    color: ${({ $active }) => ($active ? '#1f2937' : '#374151')};
    transform: translateX(2px);
  }
  
  svg {
    transition: color 0.2s ease;
  }
`;

const NavSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  padding: 0 1rem;
`;

const LogoutSection = styled.div`
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
  flex-shrink: 0; /* 로그아웃 버튼도 고정 */
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 0.5rem;
  color: #dc2626;
  width: 100%;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #fef2f2;
    transform: translateX(2px);
  }
`;

const Sidebar = ({ currentPage, onPageChange, onLogout }) => {
  const mainMenuItems = [
    { id: 'dashboard', label: '대시보드', icon: PieChart },
  ];

  const managementItems = [
    { id: 'users', label: '사용자 관리', icon: Users },
    { id: 'inquiries', label: '1:1 문의 관리', icon: Mail },
    { id: 'chat', label: '채팅방 관리', icon: MessageCircle },
  ];

  const renderNavItems = (items) => (
    items.map(item => {
      const Icon = item.icon;
      return (
        <NavButton
          key={item.id}
          $active={currentPage === item.id}
          onClick={() => onPageChange(item.id)}
        >
          <Icon size={18} />
          {item.label}
        </NavButton>
      );
    })
  );

  return (
    <Aside>
      <SidebarHeader>
        <Crown size={24} />
        <SidebarTitle>Festival Admin</SidebarTitle>
      </SidebarHeader>
      
      <Nav>
        <NavSection>
          {renderNavItems(mainMenuItems)}
        </NavSection>

        <NavSection>
          <SectionTitle>관리</SectionTitle>
          {renderNavItems(managementItems)}
        </NavSection>
      </Nav>
      
      <LogoutSection>
        <LogoutButton onClick={onLogout}>
          <LogOut size={18} />
          로그아웃
        </LogoutButton>
      </LogoutSection>
    </Aside>
  );
};

export default Sidebar;
