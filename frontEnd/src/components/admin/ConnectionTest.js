// src/components/admin/ConnectionTest.js
import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const Container = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const StatusCard = styled.div`
  padding: 1rem;
  border-radius: 0.5rem;
  background: ${props => {
    switch (props.status) {
      case 'connected': return '#f0f9f4';
      case 'connecting': return '#fef3c7';
      case 'error': return '#fef2f2';
      default: return '#f9fafb';
    }
  }};
  border: 1px solid ${props => {
    switch (props.status) {
      case 'connected': return '#bbf7d0';
      case 'connecting': return '#fed7aa';
      case 'error': return '#fecaca';
      default: return '#e5e7eb';
    }
  }};
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const StatusIndicator = styled.div`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'connected': return '#10b981';
      case 'connecting': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  animation: ${props => props.status === 'connecting' ? pulse : 'none'} 2s infinite;
`;

const StatusLabel = styled.span`
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;

const StatusMessage = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 0.75rem;
`;

const RefreshButton = styled.button`
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-left : 20px;

  &:hover {
    background: #1d4ed8;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const LastChecked = styled.div`
  text-align: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.75rem;
  color: #6b7280;
`;

const ConnectionTest = () => {
  const [connections, setConnections] = useState({
    api: { status: 'connecting', message: '연결 확인 중...' },
    database: { status: 'connecting', message: '연결 확인 중...' },
    auth: { status: 'connecting', message: '연결 확인 중...' }
  });
  const [lastChecked, setLastChecked] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkConnections = async () => {
    setIsRefreshing(true);
    
    // API 연결 테스트
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setConnections(prev => ({
          ...prev,
          api: { status: 'connected', message: 'API 서버 연결 정상' }
        }));
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setConnections(prev => ({
        ...prev,
        api: { 
          status: 'error', 
          message: `API 연결 실패: ${error.message}` 
        }
      }));
    }

    // 데이터베이스 연결 테스트 (API 응답으로 추정)
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users?size=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setConnections(prev => ({
          ...prev,
          database: { status: 'connected', message: '데이터베이스 연결 정상' }
        }));
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      setConnections(prev => ({
        ...prev,
        database: { 
          status: 'error', 
          message: `데이터베이스 연결 확인 실패: ${error.message}` 
        }
      }));
    }

    // 인증 상태 확인
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // JWT 토큰 유효성 간단 체크
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        
        if (isExpired) {
          setConnections(prev => ({
            ...prev,
            auth: { status: 'error', message: '토큰이 만료되었습니다' }
          }));
        } else {
          setConnections(prev => ({
            ...prev,
            auth: { status: 'connected', message: '인증 토큰 유효' }
          }));
        }
      } catch (error) {
        setConnections(prev => ({
          ...prev,
          auth: { status: 'error', message: '토큰 형식이 잘못되었습니다' }
        }));
      }
    } else {
      setConnections(prev => ({
        ...prev,
        auth: { status: 'error', message: '토큰이 없습니다' }
      }));
    }

    setLastChecked(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkConnections();
  }, []);

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return '연결됨';
      case 'connecting': return '연결 중';
      case 'error': return '오류';
      default: return '알 수 없음';
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          🔗 시스템 연결 상태
        </Title>
        <RefreshButton 
          onClick={checkConnections} 
          disabled={isRefreshing}
        >
          {isRefreshing ? '확인 중...' : '새로고침'}
        </RefreshButton>
      </Header>

      <StatusGrid>
        <StatusCard status={connections.api.status}>
          <StatusHeader>
            <StatusIndicator status={connections.api.status} />
            <StatusLabel>API 서버</StatusLabel>
          </StatusHeader>
          <StatusMessage>
            {getStatusText(connections.api.status)}: {connections.api.message}
          </StatusMessage>
        </StatusCard>

        <StatusCard status={connections.database.status}>
          <StatusHeader>
            <StatusIndicator status={connections.database.status} />
            <StatusLabel>데이터베이스</StatusLabel>
          </StatusHeader>
          <StatusMessage>
            {getStatusText(connections.database.status)}: {connections.database.message}
          </StatusMessage>
        </StatusCard>

        <StatusCard status={connections.auth.status}>
          <StatusHeader>
            <StatusIndicator status={connections.auth.status} />
            <StatusLabel>인증 시스템</StatusLabel>
          </StatusHeader>
          <StatusMessage>
            {getStatusText(connections.auth.status)}: {connections.auth.message}
          </StatusMessage>
        </StatusCard>
      </StatusGrid>

      {lastChecked && (
        <LastChecked>
          마지막 확인: {lastChecked.toLocaleString('ko-KR')}
        </LastChecked>
      )}
    </Container>
  );
};

export default ConnectionTest;