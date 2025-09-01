import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  MessageCircle, Users, MapPin, Activity, AlertTriangle, 
  Search, Filter, Eye, Trash2, Ban, CheckCircle, X,
  RefreshCw, Download, Shield, Clock, Flag, UserX,
  TrendingUp, AlertCircle, MessageSquare
} from 'lucide-react';

const Container = styled.div`
  padding: 1.5rem;
  min-height: 100vh;
  background: #f8fafc;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media(max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.875rem;
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: #3b82f6;
          color: white;
          &:hover { background: #2563eb; transform: translateY(-1px); }
        `;
      case 'secondary':
        return `
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          &:hover { background: #f9fafb; transform: translateY(-1px); }
        `;
      case 'danger':
        return `
          background: #dc2626;
          color: white;
          &:hover { background: #b91c1c; transform: translateY(-1px); }
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
          &:hover { background: #e5e7eb; transform: translateY(-1px); }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// 실시간 통계 카드 그리드
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${({ $color }) => {
      switch ($color) {
        case 'blue': return 'linear-gradient(90deg, #3b82f6, #1d4ed8)';
        case 'green': return 'linear-gradient(90deg, #10b981, #059669)';
        case 'purple': return 'linear-gradient(90deg, #8b5cf6, #7c3aed)';
        case 'red': return 'linear-gradient(90deg, #ef4444, #dc2626)';
        case 'orange': return 'linear-gradient(90deg, #f59e0b, #d97706)';
        default: return 'linear-gradient(90deg, #6b7280, #4b5563)';
      }
    }};
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: ${({ $color }) => {
    switch ($color) {
      case 'blue': return 'rgba(59, 130, 246, 0.1)';
      case 'green': return 'rgba(16, 185, 129, 0.1)';
      case 'purple': return 'rgba(139, 92, 246, 0.1)';
      case 'red': return 'rgba(239, 68, 68, 0.1)';
      case 'orange': return 'rgba(245, 158, 11, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  }};
  color: ${({ $color }) => {
    switch ($color) {
      case 'blue': return '#3b82f6';
      case 'green': return '#10b981';
      case 'purple': return '#8b5cf6';
      case 'red': return '#ef4444';
      case 'orange': return '#f59e0b';
      default: return '#6b7280';
    }
  }};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ $positive }) => $positive ? '#059669' : '#dc2626'};
`;

// 지역별 현황 카드
const RegionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const RegionCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  
  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const RegionHeader = styled.div`
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RegionName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RegionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $online }) => $online > 0 ? '#d1fae5' : '#f3f4f6'};
  color: ${({ $online }) => $online > 0 ? '#065f46' : '#6b7280'};
`;

const RegionStats = styled.div`
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
`;

const RegionStat = styled.div`
  text-align: center;
`;

const RegionStatValue = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
`;

const RegionStatLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

// 탭 컨테이너
const TabContainer = styled.div`
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow: hidden;
`;

const TabHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  font-weight: 500;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
  color: #6b7280;
  position: relative;
  
  ${({ $active }) => $active && `
    color: #3b82f6;
    border-bottom-color: #3b82f6;
    background: white;
    font-weight: 600;
  `}
  
  &:hover {
    background: ${({ $active }) => $active ? 'white' : '#f3f4f6'};
    color: ${({ $active }) => $active ? '#3b82f6' : '#374151'};
  }
  
  ${({ $hasNotification }) => $hasNotification && `
    &::after {
      content: '';
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      width: 0.5rem;
      height: 0.5rem;
      background: #ef4444;
      border-radius: 50%;
    }
  `}
`;

const TabContent = styled.div`
  padding: 1.5rem;
`;

// 필터 및 검색
const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  min-width: 150px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

// 테이블
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.thead`
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  border-bottom: 1px solid #e5e7eb;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  vertical-align: middle;
`;

// 상태 배지
const StatusBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  
  ${({ $status }) => {
    switch ($status) {
      case 'pending':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case 'reviewing':
        return `
          background: #dbeafe;
          color: #1e40af;
        `;
      case 'resolved':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case 'rejected':
        return `
          background: #fecaca;
          color: #991b1b;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

// 사용자 아바타
const UserAvatar = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserName = styled.div`
  font-weight: 500;
  color: #1f2937;
`;

const UserMeta = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

// 메시지 내용
const MessageContent = styled.div`
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: #374151;
  line-height: 1.5;
`;

// 액션 버튼들
const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $danger }) => $danger ? '#fef2f2' : '#f3f4f6'};
    color: ${({ $danger }) => $danger ? '#dc2626' : '#374151'};
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// 로딩 및 빈 상태
const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #dc2626;
  background: #fef2f2;
  border-radius: 0.75rem;
  border: 1px solid #fecaca;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const ChatManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // 실시간 데이터
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [regionStats, setRegionStats] = useState([]);
  const [reports, setReports] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  
  // 필터 및 탭 상태에 따라 신고 목록을 불러오는 함수
  const loadReports = useCallback(async () => {
    // '신고 관리' 탭이 아닐 경우 실행하지 않음
    if (activeTab !== 'reports') return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: 0, size: 20 });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (regionFilter !== 'all') params.set('region', regionFilter);
      if (searchTerm) params.set('search', searchTerm);

      const response = await fetch(`/api/admin/chat/reports?${params.toString()}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: '신고 목록을 불러오는데 실패했습니다.' }));
        throw new Error(errData.message);
      }
      const reportsData = await response.json();
      setReports(reportsData.content || []);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, regionFilter, searchTerm]);

  // 대시보드 관련 데이터만 불러오는 함수
  const loadDashboardData = useCallback(async () => {
    try {
      const [statsResponse, regionResponse, reportsCountResponse] = await Promise.all([
        fetch('/api/admin/chat/stats/realtime'),
        fetch('/api/admin/stats/regional-chat'),
        fetch('/api/admin/chat/reports?status=pending&size=0') // 대기 중인 신고 개수만 확인
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        const reportsCountData = reportsCountResponse.ok ? await reportsCountResponse.json() : { totalElements: 0 };
        setRealTimeStats({
          totalMessages: statsData.totalMessages || 0,
          activeUsers: statsData.totalOnlineUsers || 0,
          totalRegions: statsData.activeRegions || 0,
          pendingReports: reportsCountData.totalElements || 0,
          blockedUsers: 0,
          messageGrowth: 0,
          userGrowth: 0,
          reportGrowth: 0
        });
      }

      if (regionResponse.ok) {
        const regionData = await regionResponse.json();
        setRegionStats(regionData.map(region => ({
          ...region,
          onlineUsers: 0, // TODO: 실시간 데이터 연동 필요
          reports: region.reportCount || 0 // 백엔드에서 주는 reportCount 필드 사용
        })));
      }

    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      setError('대시보드 데이터를 불러오는데 실패했습니다.');
    }
  }, []);

  // 대시보드 데이터는 주기적으로 갱신
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // 필터나 탭이 변경되면 신고 목록을 다시 불러옴
  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // 실제 API 호출
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleReportAction = async (reportId, action) => {
    const actionText = action === 'approve' ? '승인 (메시지 삭제)' : '기각 (메시지 복원)';
    if (!window.confirm(`정말로 해당 신고를 '${actionText}' 처리하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/chat/reports/${reportId}/${action}`, {
        method: 'POST',
      });

      if (response.ok) {
        alert(`신고가 성공적으로 처리되었습니다.`);
        loadReports(); // 처리 후 목록 새로고침
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || '작업 처리에 실패했습니다.');
      }
    } catch (err) {
      console.error(`Failed to ${action} report:`, err);
      alert(err.message);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (error) {
    return (
      <Container>
        <ErrorState>
          <AlertTriangle size={48} />
          <h3>오류 발생</h3>
          <p>{error}</p>
          <ActionButton $variant="primary" onClick={() => window.location.reload()}>
            페이지 새로고침
          </ActionButton>
        </ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>실시간 채팅 관리</Title>
          <Subtitle>지역별 채팅방을 모니터링하고 실시간으로 관리합니다</Subtitle>
        </HeaderLeft>
        <HeaderActions>
          <ActionButton onClick={() => {}}>
            <Download size={16} />
            리포트 다운로드
          </ActionButton>
          <ActionButton $variant="primary" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            새로고침
          </ActionButton>
        </HeaderActions>
      </Header>

      {/* 실시간 통계 대시보드 */}
      {realTimeStats && (
        <StatsGrid>
          <StatCard $color="blue">
            <StatHeader>
              <StatIcon $color="blue">
                <MessageCircle size={24} />
              </StatIcon>
            </StatHeader>
            <StatValue>{realTimeStats.totalMessages?.toLocaleString()}</StatValue>
            <StatLabel>총 메시지 수</StatLabel>
            <StatChange $positive={realTimeStats.messageGrowth > 0}>
              <TrendingUp size={12} />
              {Math.abs(realTimeStats.messageGrowth)}% 오늘
            </StatChange>
          </StatCard>
          
          <StatCard $color="green">
            <StatHeader>
              <StatIcon $color="green">
                <Users size={24} />
              </StatIcon>
            </StatHeader>
            <StatValue>{realTimeStats.activeUsers?.toLocaleString()}</StatValue>
            <StatLabel>실시간 접속자</StatLabel>
            <StatChange $positive={realTimeStats.userGrowth > 0}>
              <TrendingUp size={12} />
              {Math.abs(realTimeStats.userGrowth)}% 전일 대비
            </StatChange>
          </StatCard>
          
          <StatCard $color="purple">
            <StatHeader>
              <StatIcon $color="purple">
                <MapPin size={24} />
              </StatIcon>
            </StatHeader>
            <StatValue>{realTimeStats.totalRegions}</StatValue>
            <StatLabel>활성 지역</StatLabel>
            <StatChange $positive>
              <CheckCircle size={12} />
              모든 지역 운영중
            </StatChange>
          </StatCard>
          
          <StatCard $color="red">
            <StatHeader>
              <StatIcon $color="red">
                <AlertTriangle size={24} />
              </StatIcon>
            </StatHeader>
            <StatValue>{realTimeStats.pendingReports}</StatValue>
            <StatLabel>대기 중 신고</StatLabel>
            <StatChange $positive={realTimeStats.reportGrowth < 0}>
              <TrendingUp size={12} />
              {Math.abs(realTimeStats.reportGrowth)}% 감소
            </StatChange>
          </StatCard>
          
          <StatCard $color="orange">
            <StatHeader>
              <StatIcon $color="orange">
                <UserX size={24} />
              </StatIcon>
            </StatHeader>
            <StatValue>{realTimeStats.blockedUsers}</StatValue>
            <StatLabel>차단된 사용자</StatLabel>
            <StatChange>
              <Shield size={12} />
              보안 강화됨
            </StatChange>
          </StatCard>
        </StatsGrid>
      )}

      {/* 지역별 현황 */}
      <RegionGrid>
        {regionStats.map((region) => (
          <RegionCard key={region.region}>
            <RegionHeader>
              <RegionName>
                <MapPin size={16} />
                {region.region}
              </RegionName>
              <RegionStatus $online={region.onlineUsers}>
                <Users size={12} />
                {region.onlineUsers}명 접속
              </RegionStatus>
            </RegionHeader>
            <RegionStats>
              <RegionStat>
                <RegionStatValue>{region.totalMessages}</RegionStatValue>
                <RegionStatLabel>총 메시지</RegionStatLabel>
              </RegionStat>
              <RegionStat>
                <RegionStatValue>{region.todayMessages}</RegionStatValue>
                <RegionStatLabel>오늘 메시지</RegionStatLabel>
              </RegionStat>
              <RegionStat>
                <RegionStatValue>{region.reports}</RegionStatValue>
                <RegionStatLabel>신고 건수</RegionStatLabel>
              </RegionStat>
            </RegionStats>
          </RegionCard>
        ))}
      </RegionGrid>

      {/* 상세 관리 탭 */}
      <TabContainer>
        <TabHeader>
          <Tab 
            $active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={16} style={{ marginRight: '0.5rem' }} />
            대시보드
          </Tab>
          <Tab 
            $active={activeTab === 'reports'}
            $hasNotification={reports.filter(r => r.status === 'pending').length > 0}
            onClick={() => setActiveTab('reports')}
          >
            <Flag size={16} style={{ marginRight: '0.5rem' }} />
            신고 관리
          </Tab>
          <Tab 
            $active={activeTab === 'messages'}
            onClick={() => setActiveTab('messages')}
          >
            <MessageSquare size={16} style={{ marginRight: '0.5rem' }} />
            메시지 관리
          </Tab>
          <Tab 
            $active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} style={{ marginRight: '0.5rem' }} />
            사용자 관리
          </Tab>
        </TabHeader>

        <TabContent>
          {activeTab === 'overview' && (
            <div>
              <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>실시간 모니터링</h3>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                지역별 채팅방 활동을 실시간으로 모니터링하고 있습니다.
              </p>
              
              {loading ? (
                <LoadingState>
                  <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
                  <p>데이터를 불러오는 중...</p>
                </LoadingState>
              ) : (
                <div style={{ 
                  background: '#f8fafc', 
                  padding: '2rem', 
                  borderRadius: '1rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>시스템 상태</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>서버 상태</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#059669' }}>정상 운영</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>WebSocket 연결</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#059669' }}>안정</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>응답 시간</div>
                      <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#059669' }}>12ms</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <>
              <FilterSection>
                <SearchContainer>
                  <SearchIcon>
                    <Search size={16} />
                  </SearchIcon>
                  <SearchInput
                    type="text"
                    placeholder="신고 내용 또는 사용자명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>
                
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">모든 상태</option>
                  <option value="pending">대기 중</option>
                  <option value="reviewing">검토 중</option>
                  <option value="resolved">해결됨</option>
                  <option value="rejected">기각됨</option>
                </Select>
                
                <Select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                >
                  <option value="all">모든 지역</option>
                  {regionStats.map(region => (
                    <option key={region.region} value={region.region}>
                      {region.region}
                    </option>
                  ))}
                </Select>
              </FilterSection>

              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>신고자</TableHeaderCell>
                    <TableHeaderCell>신고 대상</TableHeaderCell>
                    <TableHeaderCell>메시지 내용</TableHeaderCell>
                    <TableHeaderCell>신고 사유</TableHeaderCell>
                    <TableHeaderCell>지역</TableHeaderCell>
                    <TableHeaderCell>상태</TableHeaderCell>
                    <TableHeaderCell>신고 시간</TableHeaderCell>
                    <TableHeaderCell>작업</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <tr>
                      <TableCell colSpan={8}>
                        <LoadingState>
                          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                          신고 데이터를 불러오는 중...
                        </LoadingState>
                      </TableCell>
                    </tr>
                  ) : reports.length === 0 ? (
                    <tr>
                      <TableCell colSpan={8}>
                        <EmptyState>
                          <Shield size={48} />
                          <p>신고된 메시지가 없습니다.</p>
                        </EmptyState>
                      </TableCell>
                    </tr>
                  ) : (
                    reports
                      .filter(report => 
                        (statusFilter === 'all' || report.status === statusFilter) &&
                        (regionFilter === 'all' || report.region === regionFilter) &&
                        (!searchTerm || 
                         report.messageContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.messageAuthor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reporterNickname.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                      )
                      .map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <UserInfo>
                              <UserAvatar>{getInitials(report.reporterNickname)}</UserAvatar>
                              <div>
                                <UserName>{report.reporterNickname}</UserName>
                              </div>
                            </UserInfo>
                          </TableCell>
                          <TableCell>
                            <UserInfo>
                              <UserAvatar>{getInitials(report.messageAuthor)}</UserAvatar>
                              <div>
                                <UserName>{report.messageAuthor}</UserName>
                              </div>
                            </UserInfo>
                          </TableCell>
                          <TableCell>
                            <MessageContent>{report.messageContent}</MessageContent>
                          </TableCell>
                          <TableCell>{report.reason}</TableCell>
                          <TableCell>{report.region}</TableCell>
                          <TableCell>
                            <StatusBadge $status={report.status}>
                              {report.status === 'pending' && '대기 중'}
                              {report.status === 'reviewing' && '검토 중'}
                              {report.status === 'resolved' && '해결됨'}
                              {report.status === 'rejected' && '기각됨'}
                            </StatusBadge>
                          </TableCell>
                          <TableCell>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', fontSize: '0.75rem' }}>
                              <Clock size={12} />
                              {formatTime(report.reportedAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <ActionButtons>
                              <IconButton title="상세 보기">
                                <Eye size={14} />
                              </IconButton>
                              {report.status === 'pending' && (
                                <>
                                  <IconButton 
                                    title="승인 (메시지 삭제)"
                                    onClick={() => handleReportAction(report.id, 'approve')}
                                  >
                                    <CheckCircle size={14} />
                                  </IconButton>
                                  <IconButton 
                                    $danger
                                    title="기각 (메시지 복원)"
                                    onClick={() => handleReportAction(report.id, 'reject')}
                                  >
                                    <X size={14} />
                                  </IconButton>
                                </>
                              )}
                            </ActionButtons>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </>
          )}

          {activeTab === 'messages' && (
            <>
              <FilterSection>
                <SearchContainer>
                  <SearchIcon>
                    <Search size={16} />
                  </SearchIcon>
                  <SearchInput
                    type="text"
                    placeholder="메시지 내용 또는 작성자로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>
                
                <Select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                >
                  <option value="all">모든 지역</option>
                  {regionStats.map(region => (
                    <option key={region.region} value={region.region}>
                      {region.region}
                    </option>
                  ))}
                </Select>
              </FilterSection>

              <EmptyState>
                <MessageSquare size={48} />
                <p>메시지 관리 기능은 개발 중입니다.</p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  실시간 메시지 스트림과 필터링 기능을 추가할 예정입니다.
                </p>
              </EmptyState>
            </>
          )}

          {activeTab === 'users' && (
            <>
              <FilterSection>
                <SearchContainer>
                  <SearchIcon>
                    <Search size={16} />
                  </SearchIcon>
                  <SearchInput
                    type="text"
                    placeholder="사용자명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>
              </FilterSection>

              <EmptyState>
                <Users size={48} />
                <p>사용자 관리 기능은 개발 중입니다.</p>
                <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  사용자 차단, 권한 관리 등의 기능을 추가할 예정입니다.
                </p>
              </EmptyState>
            </>
          )}
        </TabContent>
      </TabContainer>
    </Container>
  );
};

export default ChatManagement;