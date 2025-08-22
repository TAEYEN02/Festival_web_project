// src/components/TopBar.js
import React from 'react';
import styled from 'styled-components';
import { TrendingUp, Bell } from 'lucide-react';

const TopBarContainer = styled.div`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 30;
`;

const TopBarFlex = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconWrapper = styled.div`
  padding: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TitleText = styled.div`
  h1 {
    font-size: 1.5rem;
    font-weight: bold;
    color: #111827;
    margin: 0;
  }
  p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NotificationButton = styled.button`
  position: relative;
  padding: 0.75rem;
  border: none;
  background: transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;

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
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`;

const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

const Avatar = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1rem;
`;

const ProfileInfo = styled.div`
  @media(max-width: 640px) {
    display: none;
  }
`;

const ProfileName = styled.div`
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
`;

const ProfileRole = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const StatusRow = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
  flex-wrap: wrap;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
  
  &:first-child {
    color: #059669;
  }
`;

const StatusDot = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
`;

const TopBar = ({ stats }) => {
  return (
    <TopBarContainer>
      <TopBarFlex>
        <TopBarLeft>
          <TitleContainer>
            <IconWrapper>
              <TrendingUp size={24} style={{ color: 'white' }} />
            </IconWrapper>
            <TitleText>
              <h1>관리자 대시보드</h1>
              <p>축제 플랫폼 통합 관리 시스템</p>
            </TitleText>
          </TitleContainer>
        </TopBarLeft>
        
        <TopBarRight>
          <NotificationButton>
            <Bell size={24} style={{ color: '#6b7280' }} />
            <Badge>{stats?.pendingInquiries || 0}</Badge>
          </NotificationButton>
          
          <Profile>
            <Avatar>관</Avatar>
            <ProfileInfo>
              <ProfileName>관리자</ProfileName>
              <ProfileRole>Super Admin</ProfileRole>
            </ProfileInfo>
          </Profile>
        </TopBarRight>
      </TopBarFlex>
      
      <StatusRow>
        <StatusItem>
          <StatusDot $color="#22c55e" />
          시스템 정상 운영
        </StatusItem>
        <StatusItem>
          <StatusDot $color="#3b82f6" />
          실시간 사용자: {stats?.activeChatUsers?.toLocaleString() || 0}명
        </StatusItem>
        <StatusItem>
          <StatusDot $color="#f59e0b" />
          대기 중인 문의: {stats?.pendingInquiries || 0}건
        </StatusItem>
        <StatusItem>
          <StatusDot $color="#8b5cf6" />
          활성 축제: {stats?.activeFestivals || 0}개
        </StatusItem>
      </StatusRow>
    </TopBarContainer>
  );
};

export default TopBar;