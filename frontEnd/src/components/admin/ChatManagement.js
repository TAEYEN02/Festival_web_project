import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  MessageCircle, Users, MapPin, Activity, AlertTriangle,
  Search, Filter, Eye, Trash2, Ban, CheckCircle, X,
  RefreshCw, Download, Shield, Clock, Flag, UserX,
  TrendingUp, AlertCircle, MessageSquare, MoreHorizontal
} from 'lucide-react';
import { getCurrentUser } from '../../api/auth';

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
  width: 95%;
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

const StatusBadge = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  
  ${({ $status }) => {
    switch ($status?.toUpperCase()) {
      case 'PENDING':
        return `background: #fef3c7; color: #92400e;`;
      case 'REVIEWING':
        return `background: #dbeafe; color: #1e40af;`;
      case 'RESOLVED':
        return `background: #d1fae5; color: #065f46;`;
      case 'REJECTED':
        return `background: #fecaca; color: #991b1b;`;
      case 'TRUE':
      case 'ACTIVE':
        return `background: #d1fae5; color: #065f46;`;
      case 'FALSE':
      case 'INACTIVE':
        return `background: #f3f4f6; color: #6b7280;`;
      case 'REPORTED':
        return `background: #fef3c7; color: #92400e;`;
      case 'NORMAL':
        return `background: #d1fae5; color: #065f46;`;
      default:
        return `background: #f3f4f6; color: #6b7280;`;
    }
  }}
`;

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
  padding: 1.5rem;
  color: #dc2626;
  background: #fef2f2;
  border-radius: 0.75rem;
  border: 1px solid #fecaca;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  background: ${({ $active }) => $active ? '#3b82f6' : 'white'};
  color: ${({ $active }) => $active ? 'white' : '#374151'};
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ $active }) => $active ? '#2563eb' : '#f9fafb'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LastUpdated = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
`;

const ChatManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 실시간 데이터
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [regionalStats, setRegionalStats] = useState([]);
  const [reports, setReports] = useState([]);
  const [messages, setMessages] = useState([]);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // API 헬퍼 함수
  const callAPI = async (url, options = {}) => {
    const currentUser = getCurrentUser();
    const token = currentUser?.token;

    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("API Error Response:", errorBody);
      throw new Error(`HTTP ${response.status}: ${response.statusText}. 서버 응답을 확인하세요.`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    } else {
      const responseText = await response.text();
      console.error("Received non-JSON response:", responseText);
      throw new SyntaxError("서버로부터 유효하지 않은 JSON 응답을 받았습니다.");
    }
  };

  // 실시간 대시보드 데이터 로드
  const loadDashboardData = useCallback(async () => {
    if (activeTab !== 'overview') return;

    // 초기 로딩이 아닌 경우에는 로딩 상태를 표시하지 않음
    if (!realTimeStats) {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('실시간 대시보드 데이터 로드...', new Date().toLocaleTimeString());

      const chatDashboard = await callAPI('/api/admin/dashboard');
      console.log('채팅 대시보드 데이터:', chatDashboard);

      const realTimeData = chatDashboard;
      const newStats = {
        totalMessages: realTimeData.totalMessages || 0,
        activeUsers: realTimeData.onlineUsers || realTimeData.activeChatUsers || 0, // API 필드명에 맞춤
        totalRegions: realTimeData.activeRegions || realTimeData.totalRegions || 0,
        pendingReports: realTimeData.pendingReports || realTimeData.pendingInquiries || 0, // API 필드명에 맞춤
        lastUpdated: new Date().toLocaleTimeString('ko-KR')
      };

      // 이전 데이터와 비교하여 변화가 있는지 확인
      if (realTimeStats) {
        console.log('데이터 변화 확인:', {
          이전: realTimeStats,
          현재: newStats,
          변화있음: JSON.stringify(realTimeStats) !== JSON.stringify({...newStats, lastUpdated: realTimeStats.lastUpdated})
        });
      }

      setRealTimeStats(newStats);

      const regionalData = chatDashboard.regionalStats || [];
      setRegionalStats(regionalData.map(region => ({
        region: region.region,
        totalMessages: region.totalMessages || 0,
        todayMessages: region.todayMessages || 0,
        activeUsers: region.activeUsers || 0,
        reports: region.reportCount || 0
      })));

    } catch (error) {
      console.error('대시보드 로드 실패:', error);
      setError(`대시보드를 불러올 수 없습니다: ${error.message}`);
    } finally {
      if (!realTimeStats) {
        setLoading(false);
      }
    }
  }, [activeTab, realTimeStats]);

  // 신고 목록 로드
  const loadReports = useCallback(async () => {
    if (activeTab !== 'reports') return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: '20'
      });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (regionFilter !== 'all') params.set('region', regionFilter);

      console.log(`신고 목록 로드: ${params.toString()}`);
      const reportsData = await callAPI(`/api/admin/chat/reports?${params.toString()}`);

      setReports(reportsData.content || []);
      setTotalPages(reportsData.totalPages || 0);
      setTotalElements(reportsData.totalElements || 0);
      setCurrentPage(reportsData.number || 0);

      console.log(`신고 ${reportsData.totalElements}건 로드 완료`);
    } catch (err) {
      setError(`신고 목록 로드 실패: ${err.message}`);
      console.error('신고 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, regionFilter, currentPage]);

  // 메시지 목록 로드
  const loadMessages = useCallback(async () => {
    if (activeTab !== 'messages') return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: '20'
      });
      if (regionFilter !== 'all') params.set('region', regionFilter);
      if (searchTerm) params.set('search', searchTerm);

      console.log(`메시지 목록 로드: ${params.toString()}`);
      const messagesData = await callAPI(`/api/admin/chat/messages?${params.toString()}`);

      setMessages(messagesData.content || []);
      setTotalPages(messagesData.totalPages || 0);
      setTotalElements(messagesData.totalElements || 0);
      setCurrentPage(messagesData.number || 0);

      console.log(`메시지 ${messagesData.totalElements}건 로드 완료`);
    } catch (err) {
      setError(`메시지 목록 로드 실패: ${err.message}`);
      console.error('메시지 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, regionFilter, searchTerm, currentPage]);

  // 실시간 업데이트 (3초마다 자동 새로고침)
  useEffect(() => {
    if (activeTab === 'overview') {
      loadDashboardData();
      const interval = setInterval(loadDashboardData, 3000);
      return () => clearInterval(interval);
    } else if (activeTab === 'reports') {
      loadReports();
    } else if (activeTab === 'messages') {
      loadMessages();
    }
  }, [activeTab, loadDashboardData, loadReports, loadMessages]);

  // 탭 변경시 상태 리셋
  useEffect(() => {
    setCurrentPage(0);
    setError(null);
  }, [activeTab]);

  // 검색어나 필터 변경시 첫 페이지로
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter, regionFilter]);

  // 새로고침 버튼 클릭 시 수동 업데이트
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'overview') {
        await loadDashboardData();
      } else if (activeTab === 'reports') {
        await loadReports();
      } else if (activeTab === 'messages') {
        await loadMessages();
      }
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  const handleReportAction = async (reportId, action) => {
    const newStatus = action === 'approve' ? 'RESOLVED' : 'REJECTED';
    const actionText = action === 'approve' ? '승인 (메시지 삭제)' : '기각 (메시지 복원)';

    if (!window.confirm(`해당 신고를 '${actionText}' 처리하시겠습니까?`)) return;

    try {
      await callAPI(`/api/admin/chat/reports/${reportId}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          adminNotes: `관리자에 의해 ${actionText} 처리됨`
        }),
      });

      alert('신고가 처리되었습니다.');
      loadReports();
      if (activeTab === 'overview') loadDashboardData();
    } catch (err) {
      alert(`신고 처리 실패: ${err.message}`);
    }
  };

  const handleMessageDelete = async (messageId) => {
    if (!window.confirm('해당 메시지를 삭제하시겠습니까?')) return;

    try {
      await callAPI(`/api/admin/chat/messages/${messageId}`, { method: 'DELETE' });
      alert('메시지가 삭제되었습니다.');
      loadMessages();
      if (activeTab === 'overview') loadDashboardData();
    } catch (err) {
      alert(`메시지 삭제 실패: ${err.message}`);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const getStatusText = (status) => {
    switch (status?.toString().toUpperCase()) {
      case 'PENDING': return '대기 중';
      case 'REVIEWING': return '검토 중';
      case 'RESOLVED': return '해결됨';
      case 'REJECTED': return '기각됨';
      case 'TRUE':
      case 'ACTIVE': return '활성';
      case 'FALSE':
      case 'INACTIVE': return '비활성';
      default: return status || '알 수 없음';
    }
  };

  const pendingReportsCount = reports.filter(r => (r.status || '').toUpperCase() === 'PENDING').length;

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>실시간 채팅 관리</Title>
          <Subtitle>지역별 채팅방을 모니터링하고 실시간으로 관리합니다</Subtitle>
        </HeaderLeft>
        <HeaderActions>
          <ActionButton $variant="primary" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            새로고침
          </ActionButton>
        </HeaderActions>
      </Header>

      {/* 탭 컨테이너 */}
      <TabContainer>
        <TabHeader>
          <Tab $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            <Activity size={16} style={{ marginRight: '0.5rem' }} />
            실시간 대시보드
          </Tab>
          <Tab
            $active={activeTab === 'reports'}
            $hasNotification={pendingReportsCount > 0}
            onClick={() => setActiveTab('reports')}
          >
            <Flag size={16} style={{ marginRight: '0.5rem' }} />
            신고 관리 {pendingReportsCount > 0 && `(${pendingReportsCount})`}
          </Tab>
          <Tab $active={activeTab === 'messages'} onClick={() => setActiveTab('messages')}>
            <MessageSquare size={16} style={{ marginRight: '0.5rem' }} />
            메시지 관리
          </Tab>
        </TabHeader>

        <TabContent>
          {/* 실시간 대시보드 탭 */}
          {activeTab === 'overview' && (
            <>
              {error && (
                <ErrorState>
                  <AlertTriangle size={24} />
                  <p>{error}</p>
                  <ActionButton $variant="primary" onClick={loadDashboardData}>
                    다시 시도
                  </ActionButton>
                </ErrorState>
              )}

              {loading ? (
                <LoadingState>
                  <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
                  <p>실시간 데이터를 불러오는 중...</p>
                </LoadingState>
              ) : realTimeStats ? (
                <>
                  {/* 실시간 통계 카드 */}
                  <StatsGrid>
                    <StatCard $color="green">
                      <StatHeader>
                        <StatIcon $color="green">
                          <Users size={24} />
                        </StatIcon>
                      </StatHeader>
                      <StatValue>{realTimeStats.activeUsers?.toLocaleString()}</StatValue>
                      <StatLabel>현재 접속자</StatLabel>
                      <LastUpdated>
                        <Clock size={12} />
                        마지막 업데이트: {realTimeStats.lastUpdated}
                      </LastUpdated>
                    </StatCard>

                    <StatCard $color="red">
                      <StatHeader>
                        <StatIcon $color="red">
                          <AlertTriangle size={24} />
                        </StatIcon>
                      </StatHeader>
                      <StatValue>{realTimeStats.pendingReports}</StatValue>
                      <StatLabel>대기 중 신고</StatLabel>
                      <StatChange $positive={realTimeStats.pendingReports === 0}>
                        <Shield size={12} />
                        {realTimeStats.pendingReports === 0 ? '처리 완료' : '처리 필요'}
                      </StatChange>
                    </StatCard>

                    <StatCard $color="blue">
                      <StatHeader>
                        <StatIcon $color="blue">
                          <MessageCircle size={24} />
                        </StatIcon>
                      </StatHeader>
                      <StatValue>{realTimeStats.totalMessages?.toLocaleString()}</StatValue>
                      <StatLabel>총 메시지</StatLabel>
                      <StatChange $positive={true}>
                        <TrendingUp size={12} />
                        활발한 활동
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
                      <StatChange $positive={true}>
                        <Activity size={12} />
                        전체 운영 중
                      </StatChange>
                    </StatCard>
                  </StatsGrid>

                  {/* 지역별 현황 */}
                  <RegionGrid>
                    {regionalStats.map((region, index) => (
                      <RegionCard key={region.region || index}>
                        <RegionHeader>
                          <RegionName>
                            <MapPin size={16} />
                            {region.region}
                          </RegionName>
                          <RegionStatus $online={region.activeUsers}>
                            <Users size={12} />
                            {region.activeUsers}명 접속
                          </RegionStatus>
                        </RegionHeader>
                        <RegionStats>
                          <RegionStat>
                            <RegionStatValue>{region.totalMessages?.toLocaleString()}</RegionStatValue>
                            <RegionStatLabel>총 메시지</RegionStatLabel>
                          </RegionStat>
                          <RegionStat>
                            <RegionStatValue>{region.todayMessages?.toLocaleString()}</RegionStatValue>
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
                </>
              ) : (
                <EmptyState>
                  <Activity size={48} />
                  <p>대시보드 데이터를 불러올 수 없습니다.</p>
                  <ActionButton $variant="primary" onClick={loadDashboardData}>
                    다시 시도
                  </ActionButton>
                </EmptyState>
              )}
            </>
          )}

          {/* 신고 관리 탭 */}
          {activeTab === 'reports' && (
            <>
              <FilterSection>
                <SearchContainer>
                  <SearchIcon><Search size={16} /></SearchIcon>
                  <SearchInput
                    type="text"
                    placeholder="신고 내용 또는 사용자명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>

                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">모든 상태</option>
                  <option value="PENDING">대기 중</option>
                  <option value="REVIEWING">검토 중</option>
                  <option value="RESOLVED">해결됨</option>
                  <option value="REJECTED">기각됨</option>
                </Select>
              </FilterSection>

              {error && (
                <ErrorState>
                  <AlertTriangle size={24} />
                  <p>{error}</p>
                </ErrorState>
              )}

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
                          <p>신고가 없습니다.</p>
                        </EmptyState>
                      </TableCell>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <UserInfo>
                            <UserAvatar>{getInitials(report.reporterNickname)}</UserAvatar>
                            <UserName>{report.reporterNickname || '익명'}</UserName>
                          </UserInfo>
                        </TableCell>
                        <TableCell>
                          <UserInfo>
                            <UserAvatar>{getInitials(report.messageAuthor)}</UserAvatar>
                            <UserName>{report.messageAuthor || '알 수 없음'}</UserName>
                          </UserInfo>
                        </TableCell>
                        <TableCell>
                          <MessageContent>{report.messageContent}</MessageContent>
                        </TableCell>
                        <TableCell>{report.reason}</TableCell>
                        <TableCell>{report.region}</TableCell>
                        <TableCell>
                          <StatusBadge $status={report.status}>
                            {getStatusText(report.status)}
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
                            {(report.status || '').toUpperCase() === 'PENDING' && (
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

              {totalPages > 1 && (
                <Pagination>
                  <PageButton onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>이전</PageButton>
                  {[...Array(Math.min(totalPages, 10))].map((_, i) => {
                    const pageNum = currentPage < 5 ? i : currentPage - 4 + i;
                    if (pageNum >= totalPages) return null;
                    return (
                      <PageButton key={pageNum} $active={pageNum === currentPage} onClick={() => setCurrentPage(pageNum)}>
                        {pageNum + 1}
                      </PageButton>
                    );
                  })}
                  <PageButton onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1}>다음</PageButton>
                </Pagination>
              )}
            </>
          )}

          {/* 메시지 관리 탭 */}
          {activeTab === 'messages' && (
            <>
              <FilterSection>
                <SearchContainer>
                  <SearchIcon><Search size={16} /></SearchIcon>
                  <SearchInput
                    type="text"
                    placeholder="메시지 내용 또는 작성자로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>
              </FilterSection>

              {error && (
                <ErrorState>
                  <AlertTriangle size={24} />
                  <p>{error}</p>
                </ErrorState>
              )}

              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>작성자</TableHeaderCell>
                    <TableHeaderCell>메시지 내용</TableHeaderCell>
                    <TableHeaderCell>지역</TableHeaderCell>
                    <TableHeaderCell>작성 시간</TableHeaderCell>
                    <TableHeaderCell>신고 상태</TableHeaderCell>
                    <TableHeaderCell>작업</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <tr>
                      <TableCell colSpan={6}>
                        <LoadingState>
                          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                          메시지를 불러오는 중...
                        </LoadingState>
                      </TableCell>
                    </tr>
                  ) : messages.length === 0 ? (
                    <tr>
                      <TableCell colSpan={6}>
                        <EmptyState>
                          <MessageSquare size={48} />
                          <p>메시지가 없습니다.</p>
                        </EmptyState>
                      </TableCell>
                    </tr>
                  ) : (
                    messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          <UserInfo>
                            <UserAvatar>{getInitials(message.userNickname)}</UserAvatar>
                            <UserName>{message.userNickname}</UserName>
                          </UserInfo>
                        </TableCell>
                        <TableCell>
                          <MessageContent>{message.message}</MessageContent>
                        </TableCell>
                        <TableCell>{message.region}</TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', fontSize: '0.75rem' }}>
                            <Clock size={12} />
                            {formatTime(message.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge $status={message.reported ? 'REPORTED' : 'NORMAL'}>
                            {message.reported ? '신고됨' : '정상'}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          <ActionButtons>
                            <IconButton
                              $danger
                              title="메시지 삭제"
                              onClick={() => handleMessageDelete(message.id)}
                            >
                              <Trash2 size={14} />
                            </IconButton>
                          </ActionButtons>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <Pagination>
                  <PageButton onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>이전</PageButton>
                  {[...Array(Math.min(totalPages, 10))].map((_, i) => {
                    const pageNum = currentPage < 5 ? i : currentPage - 4 + i;
                    if (pageNum >= totalPages) return null;
                    return (
                      <PageButton key={pageNum} $active={pageNum === currentPage} onClick={() => setCurrentPage(pageNum)}>
                        {pageNum + 1}
                      </PageButton>
                    );
                  })}
                  <PageButton onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1}>다음</PageButton>
                </Pagination>
              )}

              {totalElements > 0 && (
                <div style={{ textAlign: 'center', marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                  총 {totalElements.toLocaleString()}건 중 {currentPage * 20 + 1}-{Math.min((currentPage + 1) * 20, totalElements)}건 표시
                </div>
              )}
            </>
          )}
        </TabContent>
      </TabContainer>
    </Container>
  );
};

export default ChatManagement;