import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  Search, Filter, MessageSquare, Clock, CheckCircle, Eye, Reply, RefreshCw,
  User, Calendar, AlertCircle, X, Send, Download, Trash2, MoreHorizontal
} from 'lucide-react';
import * as adminAPI from '../../api/admin';

// Styled Components (기존과 동일하므로 생략...)
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
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: #2563eb;
          color: white;
          &:hover { background: #1d4ed8; transform: translateY(-1px); }
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
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
`;

const StatIcon = styled.div`
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: ${({ $color }) => {
    switch ($color) {
      case 'blue': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'yellow': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'green': return 'linear-gradient(135deg, #10b981, #059669)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
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
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
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
  min-width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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
  border-radius: 0.5rem;
  font-size: 0.875rem;
  min-width: 140px;
  background: white;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    background: #f8fafc;
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
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
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
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        color: #92400e;
      `;
    } else if ($status === 'ANSWERED') {
      return `
        background: linear-gradient(135deg, #d1fae5, #a7f3d0);
        color: #065f46;
      `;
    } else {
      return `
        background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
        color: #6b7280;
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

const ErrorState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #dc2626;
  background: #fef2f2;
  border-radius: 0.5rem;
  margin: 1rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
`;

const PaginationInfo = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  background: ${({ $active }) => ($active ? '#2563eb' : 'white')};
  color: ${({ $active }) => ($active ? 'white' : '#374151')};
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${({ $active }) => ($active ? '#1d4ed8' : '#f9fafb')};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Modal Components (기존과 동일)
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
  background: white;
  border-radius: 1rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
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
    background: #f3f4f6;
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
  background: #f8fafc;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 1rem 0;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  border: 1px solid #e5e7eb;
`;

const AnswerContent = styled.div`
  background: #f0f9ff;
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
  border-top: 1px solid #e5e7eb;
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
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
`;

const InquiryManagement = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const pageSize = 10;

  // 문의 목록 로드
  const loadInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const statusValue = statusFilter === 'all' ? null : statusFilter;
      const response = await adminAPI.fetchInquiries(
        page,
        pageSize,
        statusValue,
        searchTerm,
        sortBy,
        sortDir
      );

      setInquiries(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('문의 목록 로드 실패:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchTerm, sortBy, sortDir]);

  // 통계 데이터 로드
  const loadStats = useCallback(async () => {
    try {
      const dashboardData = await adminAPI.fetchDashboardStats();
      setStats({
        total: dashboardData.totalInquiries || 0,
        pending: dashboardData.pendingInquiries || 0,
        answered: dashboardData.answeredInquiries || 0
      });
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  }, []);

  // 새로고침
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadInquiries(), loadStats()]);
    } finally {
      setRefreshing(false);
    }
  };

  // 데이터 내보내기
  const handleExport = async () => {
    try {
      await adminAPI.exportData('inquiries', 'excel', {
        status: statusFilter === 'all' ? null : statusFilter,
        search: searchTerm
      });
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
      alert('데이터 내보내기에 실패했습니다.');
    }
  };

  // 초기 로드
  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // 검색 핸들러
  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      setPage(0);
      loadInquiries();
    }
  };

  // 문의 상세보기/답변하기
  const handleInquiryClick = async (inquiry) => {
    try {
      const detail = await adminAPI.fetchInquiryDetail(inquiry.id);
      setSelectedInquiry(detail);
      setShowModal(true);
      setAnswerText('');
    } catch (error) {
      console.error('문의 상세 정보 로드 실패:', error);
      alert('문의 정보를 불러오는데 실패했습니다.');
    }
  };

  // 답변 제출
  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !selectedInquiry) return;

    try {
      setAnswering(true);
      const updatedInquiry = await adminAPI.answerInquiry(selectedInquiry.id, answerText);

      setSelectedInquiry(updatedInquiry);
      setInquiries(prev => prev.map(inquiry =>
        inquiry.id === selectedInquiry.id
          ? { ...inquiry, status: 'ANSWERED' }
          : inquiry
      ));

      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        answered: prev.answered + 1
      }));

      alert('답변이 성공적으로 등록되었습니다.');
      setShowModal(false);
      setSelectedInquiry(null);
      setAnswerText('');

    } catch (error) {
      console.error('답변 등록 실패:', error);
      alert('답변 등록에 실패했습니다: ' + error.message);
    } finally {
      setAnswering(false);
    }
  };

  // 문의 삭제
  const handleDeleteInquiry = async (inquiryId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('이 문의를 삭제하시겠습니까?')) return;

    try {
      await adminAPI.deleteInquiry(inquiryId);
      setInquiries(prev => prev.filter(inquiry => inquiry.id !== inquiryId));
      setStats(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      alert('문의가 삭제되었습니다.');
    } catch (error) {
      console.error('문의 삭제 실패:', error);
      alert('문의 삭제에 실패했습니다: ' + error.message);
    }
  };


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

  if (error) {
    return (
      <Container>
        <ErrorState>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
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
      <MainContent>
        <Header>
          <HeaderLeft>
            <Title>1:1 문의 관리</Title>
            <Subtitle>사용자 문의에 신속하게 답변하고 관리합니다</Subtitle>
          </HeaderLeft>
          <HeaderActions>
            <ActionButton $variant="primary" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              새로고침
            </ActionButton>
          </HeaderActions>
        </Header>

        {/* 통계 카드 */}
        <StatsGrid>
          <StatCard>
            <StatIcon $color="blue">
              <MessageSquare size={24} />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.total.toLocaleString()}</StatValue>
              <StatLabel>전체 문의</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard>
            <StatIcon $color="yellow">
              <Clock size={24} />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.pending.toLocaleString()}</StatValue>
              <StatLabel>답변 대기</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard>
            <StatIcon $color="green">
              <CheckCircle size={24} />
            </StatIcon>
            <StatInfo>
              <StatValue>{stats.answered.toLocaleString()}</StatValue>
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
                onKeyPress={handleSearch}
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
              <option value="CLOSED">종료</option>
            </Select>

            <Select
              value={`${sortBy},${sortDir}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split(',');
                setSortBy(field);
                setSortDir(direction);
                setPage(0);
              }}
            >
              <option value="createdAt,desc">최신순</option>
              <option value="createdAt,asc">등록순</option>
              <option value="status,asc">상태순</option>
            </Select>

            <ActionButton onClick={handleSearch}>
              검색
            </ActionButton>
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
              ) : inquiries.length === 0 ? (
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
                inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell onClick={() => handleInquiryClick(inquiry)}>
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
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <ActionButton
                          $variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInquiryClick(inquiry);
                          }}
                        >
                          <Eye size={14} />
                          {inquiry.status === 'PENDING' ? '답변' : '보기'}
                        </ActionButton>
                        <ActionButton
                          $variant="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteInquiry(inquiry.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </ActionButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationInfo>
                총 {totalElements.toLocaleString()}개 중 {Math.min(page * pageSize + 1, totalElements)}-{Math.min((page + 1) * pageSize, totalElements)}번째
              </PaginationInfo>
              <PaginationButtons>
                <PageButton
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                >
                  처음
                </PageButton>
                <PageButton
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  이전
                </PageButton>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const startPage = Math.max(0, Math.min(page - 2, totalPages - 5));
                  const pageNum = startPage + i;
                  if (pageNum >= totalPages) return null;

                  return (
                    <PageButton
                      key={pageNum}
                      $active={page === pageNum}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum + 1}
                    </PageButton>
                  );
                })}

                <PageButton
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                >
                  다음
                </PageButton>
                <PageButton
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                >
                  마지막
                </PageButton>
              </PaginationButtons>
            </Pagination>
          )}
        </TableContainer>

        {/* 문의 상세/답변 모달 */}
        {showModal && selectedInquiry && (
          <ModalOverlay onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}>
            <Modal>
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
                    {selectedInquiry.answeredAt && (
                      <DetailRow>
                        <DetailLabel>답변일:</DetailLabel>
                        <DetailValue>{formatDate(selectedInquiry.answeredAt)}</DetailValue>
                      </DetailRow>
                    )}
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
                <ActionButton onClick={() => setShowModal(false)}>
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