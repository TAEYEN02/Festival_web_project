import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Search, Filter, MessageSquare, Clock, CheckCircle, Eye, Reply, RefreshCw, User, Calendar, AlertCircle, X, Send } from 'lucide-react';

// 실제 API 호출 함수들
const adminAPI = {
  fetchInquiries: async (page = 0, size = 10, status = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      let url = `/api/admin/inquiries?page=${page}&size=${size}&sort=createdAt,desc`;
      
      if (status && status !== 'all') {
        url += `&status=${status}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('문의 목록 조회 실패:', error);
      throw error;
    }
  },

  fetchInquiryDetail: async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await fetch(`/api/admin/inquiries/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('인증이 만료되었습니다.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('문의 상세 조회 실패:', error);
      throw error;
    }
  },

  answerInquiry: async (id, answer) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await fetch(`/api/admin/inquiries/${id}/answer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answer })
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('인증이 만료되었습니다.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('문의 답변 등록 실패:', error);
      throw error;
    }
  },

  fetchDashboardStats: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('인증이 만료되었습니다.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('대시보드 통계 조회 실패:', error);
      throw error;
    }
  }
};

// Styled Components
const Container = styled.div`
  padding: 1.5rem;
  min-height: 100vh;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
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
  color: black;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Subtitle = styled.p`
  color: black;
  margin: 0;
  font-size: 1rem;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(12px);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255,255,255,0.3);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: ${({ $color }) => {
    switch ($color) {
      case 'blue': return 'linear-gradient(to right, #60a5fa, #3b82f6)';
      case 'yellow': return 'linear-gradient(to right, #fbbf24, #f59e0b)';
      case 'green': return 'linear-gradient(to right, #34d399, #10b981)';
      default: return 'linear-gradient(to right, #9ca3af, #6b7280)';
    }
  }};
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

const StatInfo = styled.div``;

const StatValue = styled.div`
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const FilterSection = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 100px;
  gap: 100px;
`;

const SearchInput = styled.input`
  width: 95%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  background: white;
  margin-right: 10px;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
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
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  min-width: 140px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }
`;

const TableContainer = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
  border-bottom: 1px solid rgba(0,0,0,0.1);
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
  border-bottom: 1px solid rgba(0,0,0,0.05);
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    background: rgba(99,102,241,0.05);
    transform: translateY(-1px);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  vertical-align: middle;
  border-bottom: 1px solid rgba(0,0,0,0.05);
`;

const InquiryInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InquiryTitle = styled.div`
  font-weight: 600;
  color: #1f2937;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const InquiryPreview = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
`;

const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: linear-gradient(to right, #e0e7ff, #c7d2fe);
  color: #3730a3;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${({ $status }) => {
    if ($status === 'PENDING') {
      return `
        background: linear-gradient(to right, #fef3c7, #fde68a);
        color: #92400e;
      `;
    } else if ($status === 'ANSWERED') {
      return `
        background: linear-gradient(to right, #d1fae5, #a7f3d0);
        color: #065f46;
      `;
    } else {
      return `
        background: linear-gradient(to right, #f3f4f6, #e5e7eb);
        color: #6b7280;
      `;
    }
  }}
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: linear-gradient(to right, #6366f1, #a855f7);
          color: white;
          &:hover { 
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(99,102,241,0.3);
          }
        `;
      case 'secondary':
        return `
          background: rgba(255,255,255,0.9);
          color: #374151;
          border: 1px solid #d1d5db;
          &:hover { 
            background: #f9fafb;
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
          &:hover { 
            background: #e5e7eb;
            transform: translateY(-1px);
          }
        `;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: rgba(255,255,255,0.98);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255,255,255,0.2);
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
  border-radius: 1rem 1rem 0 0;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 0.5rem;
  color: #6b7280;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(0,0,0,0.1);
    color: #374151;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 1rem;
  
  @media(max-width: 640px) {
    flex-direction: column;
  }
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: #374151;
  width: 120px;
  flex-shrink: 0;
`;

const DetailValue = styled.div`
  color: #6b7280;
  flex: 1;
`;

const InquiryContent = styled.div`
  background: linear-gradient(to right, #f9fafb, #f3f4f6);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 1rem 0;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  border: 1px solid rgba(0,0,0,0.1);
`;

const AnswerContent = styled.div`
  background: linear-gradient(to right, #f0f9ff, #e0f2fe);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 1rem 0;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  border: 1px solid #0ea5e9;
  border-left: 4px solid #0ea5e9;
`;

const AnswerSection = styled.div`
  border-top: 1px solid rgba(0,0,0,0.1);
  padding-top: 1.5rem;
  margin-top: 1.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(0,0,0,0.1);
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
  border-radius: 0 0 1rem 1rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(12px);
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: rgba(255,255,255,0.3);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.active {
    background: rgba(255,255,255,0.9);
    color: #6366f1;
    font-weight: 600;
  }
`;

const InquiryManagement = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [answering, setAnswering] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, answered: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const pageSize = 10;

  // 문의 목록 로드
  const loadInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const statusValue = statusFilter === 'all' ? null : statusFilter;
      const response = await adminAPI.fetchInquiries(page, pageSize, statusValue);
      setInquiries(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('문의 목록 로드 실패:', error);
      // 오류 발생 시 사용자에게 알림
      alert('문의 목록을 불러오는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  // 통계 데이터 로드
  const loadStats = useCallback(async () => {
    try {
      const dashboardData = await adminAPI.fetchDashboardStats();
      
      // 백엔드 AdminDashboardDTO 구조에 맞게 설정
      setStats({
        total: dashboardData.totalInquiries || 0,
        pending: dashboardData.pendingInquiries || 0,
        answered: dashboardData.answeredInquiries || 0
      });
    } catch (error) {
      console.error('대시보드 통계 로드 실패:', error);
      // 통계는 실패해도 기본값 유지
      setStats({ total: 0, pending: 0, answered: 0 });
    }
  }, []);

  // 새로고침
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadInquiries(), loadStats()]);
    setRefreshing(false);
  };

  // 초기 로드 및 의존성 변경 시 로드
  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // 문의 상세보기/답변하기
  const handleInquiryClick = async (inquiry) => {
    try {
      const detail = await adminAPI.fetchInquiryDetail(inquiry.id);
      setSelectedInquiry(detail);
      setShowModal(true);
      setAnswerText('');
    } catch (error) {
      console.error('문의 상세 정보 로드 실패:', error);
      alert('문의 정보를 불러오는데 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 답변 제출
  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !selectedInquiry) return;

    try {
      setAnswering(true);
      const updatedInquiry = await adminAPI.answerInquiry(selectedInquiry.id, answerText);
      
      // 성공 후 상태 업데이트
      setSelectedInquiry(updatedInquiry);

      // 목록에서도 상태 업데이트
      setInquiries(prev => prev.map(inquiry => 
        inquiry.id === selectedInquiry.id 
          ? { ...inquiry, status: 'ANSWERED' }
          : inquiry
      ));

      // 통계 업데이트
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        answered: prev.answered + 1
      }));

      alert('답변이 성공적으로 등록되었습니다.');
      setShowModal(false);
      setSelectedInquiry(null);
      setAnswerText('');
      
      // 목록 새로고침
      loadInquiries();
    } catch (error) {
      console.error('답변 등록 실패:', error);
      alert('답변 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setAnswering(false);
    }
  };

  // 검색어로 필터링
  const filteredInquiries = inquiries.filter(inquiry =>
    (inquiry.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inquiry.userNickname || inquiry.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inquiry.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inquiry.content || inquiry.message || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return '답변 대기';
      case 'ANSWERED': return '답변 완료';
      case 'CLOSED': return '종료';
      default: return status;
    }
  };

  return (
    <Container>
      <MainContent>
        {/* 헤더 */}
        <Header>
          <HeaderLeft>
            <Title>1:1 문의 관리</Title>
            <Subtitle>사용자 문의에 신속하게 답변하고 관리합니다</Subtitle>
          </HeaderLeft>
          <RefreshButton
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            새로고침
          </RefreshButton>
        </Header>

        {/* 통계 카드 */}
        <StatsGrid>
          <StatCard>
            <StatIcon $color="blue">
              <MessageSquare size={24} />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.total}</StatValue>
              <StatLabel>전체 문의</StatLabel>
            </StatInfo>
          </StatCard>
          
          <StatCard>
            <StatIcon $color="yellow">
              <Clock size={24} />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.pending}</StatValue>
              <StatLabel>답변 대기</StatLabel>
            </StatInfo>
          </StatCard>
          
          <StatCard>
            <StatIcon $color="green">
              <CheckCircle size={24} />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.answered}</StatValue>
              <StatLabel>답변 완료</StatLabel>
            </StatInfo>
          </StatCard>
        </StatsGrid>

        {/* 필터 및 검색 */}
        <FilterSection>
          <FilterRow>
            <SearchContainer>
              <SearchIcon>
                <Search size={20} />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="문의 제목, 사용자명, 카테고리로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
            
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="all">전체 상태</option>
              <option value="PENDING">답변 대기</option>
              <option value="ANSWERED">답변 완료</option>
            </Select>
          </FilterRow>
        </FilterSection>

        {/* 문의 테이블 */}
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <TableHeaderCell>문의 내용</TableHeaderCell>
                <TableHeaderCell>문의자</TableHeaderCell>
                <TableHeaderCell>카테고리</TableHeaderCell>
                <TableHeaderCell>상태</TableHeaderCell>
                <TableHeaderCell>등록일</TableHeaderCell>
                <TableHeaderCell>작업</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {loading ? (
                <tr>
                  <TableCell colSpan={6}>
                    <LoadingState>
                      <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                      데이터를 불러오는 중...
                    </LoadingState>
                  </TableCell>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <TableCell colSpan={6}>
                    <EmptyState>
                      <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                      <p>표시할 문의가 없습니다.</p>
                      {searchTerm && <p style={{ fontSize: '0.875rem' }}>검색어를 다시 확인해보세요.</p>}
                    </EmptyState>
                  </TableCell>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id} onClick={() => handleInquiryClick(inquiry)}>
                    <TableCell>
                      <InquiryInfo>
                        <InquiryTitle>{inquiry.title || '제목 없음'}</InquiryTitle>
                        <InquiryPreview>
                          {(inquiry.content || inquiry.message || '내용 없음').substring(0, 80)}...
                        </InquiryPreview>
                      </InquiryInfo>
                    </TableCell>
                    <TableCell>
                      <UserInfo>
                        <User size={16} />
                        {inquiry.userNickname || inquiry.userName || '익명'}
                      </UserInfo>
                    </TableCell>
                    <TableCell>
                      <CategoryBadge>{inquiry.category || '일반'}</CategoryBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge $status={inquiry.status}>
                        {inquiry.status === 'PENDING' && <Clock size={12} />}
                        {inquiry.status === 'ANSWERED' && <CheckCircle size={12} />}
                        {getStatusText(inquiry.status)}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
                    <TableCell>
                      <ActionButton
                        $variant="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInquiryClick(inquiry);
                        }}
                      >
                        <Eye size={14} />
                        {inquiry.status === 'PENDING' ? '답변하기' : '보기'}
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationButton
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              이전
            </PaginationButton>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationButton
                key={i}
                onClick={() => setPage(i)}
                className={page === i ? 'active' : ''}
              >
                {i + 1}
              </PaginationButton>
            ))}
            
            <PaginationButton
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
            >
              다음
            </PaginationButton>
          </Pagination>
        )}

        {/* 문의 상세/답변 모달 */}
        {showModal && selectedInquiry && (
          <ModalOverlay onClick={() => setShowModal(false)}>
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  {selectedInquiry.status === 'PENDING' ? '문의 답변하기' : '문의 상세보기'}
                </ModalTitle>
                <CloseButton onClick={() => setShowModal(false)}>
                  <X size={20} />
                </CloseButton>
              </ModalHeader>
              
              <ModalBody>
                <DetailRow>
                  <DetailLabel>문의자:</DetailLabel>
                  <DetailValue>{selectedInquiry.userNickname || selectedInquiry.userName || '익명'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>제목:</DetailLabel>
                  <DetailValue>{selectedInquiry.title || '제목 없음'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>카테고리:</DetailLabel>
                  <DetailValue>{selectedInquiry.category || '일반'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>등록일:</DetailLabel>
                  <DetailValue>{formatDate(selectedInquiry.createdAt)}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>상태:</DetailLabel>
                  <DetailValue>
                    <StatusBadge $status={selectedInquiry.status}>
                      {getStatusText(selectedInquiry.status)}
                    </StatusBadge>
                  </DetailValue>
                </DetailRow>
                
                <DetailLabel style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>문의 내용:</DetailLabel>
                <InquiryContent>
                  {selectedInquiry.content || selectedInquiry.message || '문의 내용이 없습니다.'}
                </InquiryContent>

                {selectedInquiry.answer && (
                  <>
                    <DetailLabel style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>답변 내용:</DetailLabel>
                    <AnswerContent>
                      {selectedInquiry.answer}
                    </AnswerContent>
                    <DetailRow>
                      <DetailLabel>답변일:</DetailLabel>
                      <DetailValue>{selectedInquiry.answeredAt && formatDate(selectedInquiry.answeredAt)}</DetailValue>
                    </DetailRow>
                  </>
                )}

                {selectedInquiry.status === 'PENDING' && (
                  <AnswerSection>
                    <DetailLabel style={{ marginBottom: '0.5rem' }}>답변 작성:</DetailLabel>
                    <TextArea
                      placeholder="사용자에게 전달할 답변을 작성해주세요..."
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                    />
                  </AnswerSection>
                )}
              </ModalBody>

              <ModalActions>
                <ActionButton
                  $variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  닫기
                </ActionButton>
                {selectedInquiry.status === 'PENDING' && (
                  <ActionButton
                    $variant="primary"
                    onClick={handleSubmitAnswer}
                    disabled={!answerText.trim() || answering}
                  >
                    <Send size={14} />
                    {answering ? '답변 등록 중...' : '답변 등록'}
                  </ActionButton>
                )}
              </ModalActions>
            </Modal>
          </ModalOverlay>
        )}
      </MainContent>
    </Container>
  );
};

export default InquiryManagement;