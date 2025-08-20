// TopBar.js
import React from 'react';
import styled from 'styled-components';
import { Menu, TrendingUp, Bell } from 'lucide-react';

const Container = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
`;

const Flex = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MenuButton = styled.button`
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  cursor: pointer;
  &:hover {
    background: #f3f4f6;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconWrapper = styled.div`
  padding: 0.5rem;
  background: linear-gradient(to right, #6366f1, #a855f7);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TitleText = styled.div`
  h1 {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1f2937;
  }
  p {
    font-size: 0.875rem;
    color: #6b7280;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NotificationButton = styled.button`
  position: relative;
  padding: 0.75rem;
  border-radius: 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  &:hover {
    background: #f3f4f6;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
`;

const Avatar = styled.div`
  width: 3rem;
  height: 3rem;
  background: linear-gradient(to right, #6366f1, #a855f7);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.125rem;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
  div {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 9999px;
    background-color: ${({ color }) => color};
  }
`;

const TopBar = ({ onMenuToggle }) => {
  return (
    <Container>
      <Flex>
        <LeftSection>
          <MenuButton onClick={onMenuToggle}><Menu size={24} color="#4b5563" /></MenuButton>
          <TitleContainer>
            <IconWrapper><TrendingUp size={24} color="white" /></IconWrapper>
            <TitleText>
              <h1>관리자 대시보드</h1>
              <p>시스템 현황을 한눈에 확인하세요</p>
            </TitleText>
          </TitleContainer>
        </LeftSection>
        <RightSection>
          <NotificationButton>
            <Bell size={24} color="#4b5563" />
            <Badge>3</Badge>
          </NotificationButton>
          <Profile>
            <Avatar>관</Avatar>
            <div>
              <div style={{ fontWeight: 600, color: '#1f2937' }}>태연 관리자</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Super Admin</div>
            </div>
          </Profile>
        </RightSection>
      </Flex>
      <StatsRow>
        <Stat color="#22c55e"><div />시스템 정상</Stat>
        <Stat color="#3b82f6"><div />실시간 사용자: 1,247명</Stat>
        <Stat color="#facc15"><div />대기 중인 문의: 23건</Stat>
      </StatsRow>
    </Container>
  );
};

export default TopBar;
