// src/components/TopBar.js
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  TrendingUp, Bell, RefreshCw, Settings, LogOut, User,
  CheckCircle, Clock, AlertTriangle, MessageCircle,
  X, ExternalLink
} from 'lucide-react';

const TopBarContainer = styled.div`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 30;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
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
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  position: relative;
  padding: 0.75rem;
  border: none;
  background: transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #f3f4f6;
    color: #374151;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  ${({ $loading }) => $loading && `
    color: #2563eb;
    
    svg {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `}
`;

const NotificationButton = styled(ActionButton)`
  ${({ $hasNotifications }) => $hasNotifications && `
    color: #ef4444;
    
    &:hover {
      background: #fef2f2;
      color: #dc2626;
    }
  `}
`;

const Badge = styled.span`
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  min-width: 1.25rem;
  height: 1.25rem;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  animation: ${({ $pulse }) => $pulse ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

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
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
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
  transition: all 0.2s;
  
  &:first-child {
    color: #059669;
  }
  
  &:hover {
    transform: translateY(-1px);
  }
`;

const StatusDot = styled.div`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  animation: ${({ $pulse }) => $pulse ? 'pulse 2s infinite' : 'none'};
`;

// 알림 드롭다운
const NotificationDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 50;
  min-width: 320px;
  max-height: 400px;
  overflow-y: auto;
  
  ${({ $visible }) => !$visible && 'display: none;'}
`;

const NotificationHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  border-radius: 0.75rem 0.75rem 0 0;
`;

const NotificationTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const ClearButton = styled.button`
  font-size: 0.75rem;
  color: #6b7280;
  border: none;
  background: none;
  cursor: pointer;
  
  &:hover {
    color: #374151;
  }
`;

const NotificationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${({ $unread }) => $unread && `
    background: #eff6ff;
    border-left: 3px solid #2563eb;
  `}
`;

const NotificationContent = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const NotificationIcon = styled.div`
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: ${({ $type }) => {
    switch ($type) {
      case 'inquiry': return '#dbeafe';
      case 'user': return '#d1fae5';
      case 'system': return '#fef3c7';
      case 'error': return '#fecaca';
      default: return '#f3f4f6';
    }
  }};
  color: ${({ $type }) => {
    switch ($type) {
      case 'inquiry': return '#1d4ed8';
      case 'user': return '#059669';
      case 'system': return '#d97706';
      case 'error': return '#dc2626';
      default: return '#6b7280';
    }
  }};
  width: fit-content;
  height: fit-content;
`;

const NotificationText = styled.div`
  flex: 1;
`;

const NotificationMessage = styled.div`
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.25rem;
`;

const NotificationTime = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const EmptyNotifications = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: #9ca3af;
`;

// 프로필 드롭다운
const ProfileDropdown = styled(NotificationDropdown)`
  min-width: 200px;
  right: 0;
`;

const ProfileMenuItem = styled.div`
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  color: #374151;
  
  &:hover {
    background: #f8fafc;
  }
  
  ${({ $danger }) => $danger && `
    color: #dc2626;
    
    &:hover {
      background: #fef2f2;
    }
  `}
`;

const TopBar = ({ stats, onRefresh, loading }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // 더미 알림 데이터 (실제로는 API에서 받아와야 함)
  const dummyNotifications = [
    {
      id: 1,
      type: 'inquiry',
      message: '새로운 문의가 등록되었습니다.',
      time: '5분 전',
      unread: true
    },
    {
      id: 2,
      type: 'user',
      message: '신규 사용자 10명이 가입했습니다.',
      time: '1시간 전',
      unread: true
    },
    {
      id: 3,
      type: 'system',
      message: '시스템 업데이트가 완료되었습니다.',
      time: '2시간 전',
      unread: false
    }
  ];

  useEffect(() => {
    setNotifications(dummyNotifications);
  }, []);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 새로고침 핸들러
  const handleRefresh = () => {
    if (onRefresh && !loading) {
      onRefresh();
      setLastRefresh(new Date());
    }
  };

  // 알림 클리어
  const handleClearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  // 알림 아이콘 선택
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'inquiry': return <MessageCircle size={16} />;
      case 'user': return <User size={16} />;
      case 'system': return <Settings size={16} />;
      case 'error': return <AlertTriangle size={16} />;
      default: return <Bell size={16} />;
    }
  };

  // 읽지 않은 알림 수
  const unreadCount = notifications.filter(n => n.unread).length;

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
          {/* 새로고침 버튼 */}
          <ActionButton 
            onClick={handleRefresh} 
            disabled={loading}
            $loading={loading}
            title={`마지막 업데이트: ${lastRefresh.toLocaleTimeString()}`}
          >
            <RefreshCw size={20} />
            {loading && <span style={{ fontSize: '0.75rem' }}>업데이트 중...</span>}
          </ActionButton>
          
          {/* 알림 버튼 */}
          <div style={{ position: 'relative' }} ref={notificationRef}>
            <NotificationButton
              onClick={() => setShowNotifications(!showNotifications)}
              $hasNotifications={unreadCount > 0}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <Badge $pulse={unreadCount > 0}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </NotificationButton>
            
            <NotificationDropdown $visible={showNotifications}>
              <NotificationHeader>
                <NotificationTitle>알림</NotificationTitle>
                {notifications.length > 0 && (
                  <ClearButton onClick={handleClearNotifications}>
                    모두 지우기
                  </ClearButton>
                )}
              </NotificationHeader>
              
              <NotificationList>
                {notifications.length === 0 ? (
                  <EmptyNotifications>
                    <CheckCircle size={48} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
                    <div>새로운 알림이 없습니다</div>
                  </EmptyNotifications>
                ) : (
                  notifications.map((notification) => (
                    <NotificationItem 
                      key={notification.id} 
                      $unread={notification.unread}
                      onClick={() => {
                        // 알림 클릭 처리
                        setNotifications(prev => 
                          prev.map(n => n.id === notification.id ? { ...n, unread: false } : n)
                        );
                      }}
                    >
                      <NotificationContent>
                        <NotificationIcon $type={notification.type}>
                          {getNotificationIcon(notification.type)}
                        </NotificationIcon>
                        <NotificationText>
                          <NotificationMessage>{notification.message}</NotificationMessage>
                          <NotificationTime>{notification.time}</NotificationTime>
                        </NotificationText>
                      </NotificationContent>
                    </NotificationItem>
                  ))
                )}
              </NotificationList>
            </NotificationDropdown>
          </div>
          
          {/* 프로필 메뉴 */}
          <div style={{ position: 'relative' }} ref={profileRef}>
            <Profile onClick={() => setShowProfile(!showProfile)}>
              <Avatar>관</Avatar>
              <ProfileInfo>
                <ProfileName>관리자</ProfileName>
                <ProfileRole>Super Admin</ProfileRole>
              </ProfileInfo>
            </Profile>
            
            <ProfileDropdown $visible={showProfile}>
              <ProfileMenuItem>
                <User size={16} />
                프로필 설정
              </ProfileMenuItem>
              <ProfileMenuItem>
                <Settings size={16} />
                시스템 설정
              </ProfileMenuItem>
              <ProfileMenuItem>
                <ExternalLink size={16} />
                도움말
              </ProfileMenuItem>
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }} />
              <ProfileMenuItem $danger>
                <LogOut size={16} />
                로그아웃
              </ProfileMenuItem>
            </ProfileDropdown>
          </div>
        </TopBarRight>
      </TopBarFlex>
      
      {/* 실시간 상태 표시 */}
      <StatusRow>
        <StatusItem>
          <StatusDot $color="#22c55e" $pulse />
          시스템 정상 운영
        </StatusItem>
        <StatusItem>
          <StatusDot $color="#3b82f6" />
          실시간 사용자: {stats?.activeChatUsers?.toLocaleString() || 0}명
        </StatusItem>
        <StatusItem>
          <StatusDot $color="#f59e0b" $pulse={stats?.pendingInquiries > 0} />
          대기 문의: {stats?.pendingInquiries || 0}건
        </StatusItem>
        <StatusItem>
          <StatusDot $color="#8b5cf6" />
          활성 축제: {stats?.activeFestivals || 0}개
        </StatusItem>
        <StatusItem style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#9ca3af' }}>
          <Clock size={14} />
          마지막 업데이트: {lastRefresh.toLocaleTimeString()}
        </StatusItem>
      </StatusRow>
    </TopBarContainer>
  );
};

export default TopBar;