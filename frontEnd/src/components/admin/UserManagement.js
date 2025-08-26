import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
  Search, Filter, Download, Eye, UserX, UserCheck, MoreHorizontal,
  Users, RefreshCw, AlertCircle, Trash2, Shield, Calendar, Mail
} from 'lucide-react';
import * as adminAPI from '../../api/admin';

// Styled Components
const Container = styled.div`
  padding: 1.5rem;
  min-height: 100vh;
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
  transition: all 0.2s;
  cursor: pointer;
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
      case 'green': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'red': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'purple': return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
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
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s;
  
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

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.div`
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

const UserDetails = styled.div``;

const UserName = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.div`
  color: #6b7280;
  font-size: 0.75rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${({ $status }) => {
    if ($status === true || $status === 'active') {
      return `
        background: linear-gradient(135deg, #d1fae5, #a7f3d0);
        color: #065f46;
      `;
    } else {
      return `
        background: linear-gradient(135deg, #fecaca, #fca5a5);
        color: #991b1b;
      `;
    }
  }}
`;

const ActionMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 160px;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  border: none;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
  
  ${({ $danger }) => $danger && `
    color: #dc2626;
    &:hover {
      background: #fef2f2;
    }
  `}
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

// 사용자 상세 모달 컴포넌트들
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
  max-width: 600px;
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
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: #374151;
`;

const DetailValue = styled.div`
  color: #6b7280;
`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0
  });

  const pageSize = 10;

  // 사용자 목록 로드
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isActiveFilter = statusFilter === 'all' ? null : statusFilter === 'active';
      const response = await adminAPI.fetchUsers(page, pageSize, isActiveFilter, searchTerm);

      setUsers(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchTerm]);

  // 사용자 통계 로드
  const loadUserStats = useCallback(async () => {
    try {
      const dashboardData = await adminAPI.fetchDashboardStats();

      // 활성/비활성 사용자 수 계산 (실제 API에서 이 데이터를 제공해야 함)
      const activeUsers = users.filter(user => user.isActive).length;
      const inactiveUsers = users.filter(user => !user.isActive).length;

      setStats({
        total: dashboardData.totalUsers || 0,
        active: activeUsers,
        inactive: inactiveUsers,
        newThisMonth: dashboardData.newUsersThisMonth || 0
      });
    } catch (error) {
      console.error('사용자 통계 로드 실패:', error);
    }
  }, [users]);

  // 새로고침
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadUsers(), loadUserStats()]);
    } finally {
      setRefreshing(false);
    }
  };

  // 데이터 내보내기
  const handleExport = async () => {
    try {
      await adminAPI.exportData('users', 'excel', {
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
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  // 검색 핸들러
  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      setPage(0);
      loadUsers();
    }
  };

  // 사용자 상태 토글
  const handleToggleStatus = async (userId, currentStatus) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`이 사용자를 ${currentStatus ? '비활성화' : '활성화'}하시겠습니까?`)) {
      return;
    }
    try {
      await adminAPI.toggleUserStatus(userId);

      // 로컬 상태 업데이트
      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, isActive: !user.isActive }
          : user
      ));

      // 통계 업데이트
      setStats(prev => ({
        ...prev,
        active: currentStatus ? prev.active - 1 : prev.active + 1,
        inactive: currentStatus ? prev.inactive + 1 : prev.inactive - 1
      }));

      setActiveMenu(null);
    } catch (error) {
      console.error('사용자 상태 변경 실패:', error);
      alert('사용자 상태 변경에 실패했습니다: ' + error.message);
    }
  };

  // 사용자 삭제
  const handleDeleteUser = async (userId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm('이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    try {
      await adminAPI.deleteUser(userId);

      setUsers(prev => prev.filter(user => user.id !== userId));
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));

      alert('사용자가 삭제되었습니다.');
      setActiveMenu(null);
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      alert('사용자 삭제에 실패했습니다: ' + error.message);
    }
  };

  // 사용자 상세보기
  const handleViewUser = async (user) => {
    try {
      const userDetail = await adminAPI.fetchUser(user.id);
      setSelectedUser(userDetail);
      setShowModal(true);
      setActiveMenu(null);
    } catch (error) {
      console.error('사용자 상세 조회 실패:', error);
      alert('사용자 정보를 불러오는데 실패했습니다.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  // 외부 클릭시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
      <Header>
        <HeaderLeft>
          <Title>사용자 관리</Title>
          <Subtitle>등록된 사용자들을 관리하고 모니터링합니다</Subtitle>
        </HeaderLeft>
        <HeaderActions>
          <ActionButton onClick={handleExport} disabled={loading}>
            <Download size={16} />
            데이터 내보내기
          </ActionButton>
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
            <Users size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.total.toLocaleString()}</StatValue>
            <StatLabel>전체 사용자</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="green">
            <UserCheck size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.active.toLocaleString()}</StatValue>
            <StatLabel>활성 사용자</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="red">
            <UserX size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.inactive.toLocaleString()}</StatValue>
            <StatLabel>비활성 사용자</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="purple">
            <Calendar size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.newThisMonth.toLocaleString()}</StatValue>
            <StatLabel>이번 달 신규</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* 필터 및 검색 */}
      <FilterSection>
        <FilterRow>
          <SearchContainer>
            <SearchIcon>
              <Search size={16} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="사용자 이름 또는 이메일로 검색..."
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
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </Select>

          <ActionButton onClick={handleSearch}>
            검색
          </ActionButton>
        </FilterRow>
      </FilterSection>

      {/* 사용자 테이블 */}
      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell>사용자</TableHeaderCell>
              <TableHeaderCell>가입일</TableHeaderCell>
              <TableHeaderCell>상태</TableHeaderCell>
              <TableHeaderCell>마지막 접속</TableHeaderCell>
              <TableHeaderCell>작업</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              <tr>
                <TableCell colSpan={5}>
                  <LoadingState>
                    <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    데이터를 불러오는 중...
                  </LoadingState>
                </TableCell>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <TableCell colSpan={5}>
                  <EmptyState>
                    <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p>표시할 사용자가 없습니다.</p>
                    {searchTerm && <p style={{ fontSize: '0.875rem' }}>검색어를 다시 확인해보세요.</p>}
                  </EmptyState>
                </TableCell>
              </tr>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <UserInfo>
                      <Avatar>{getInitials(user.nickname || user.name)}</Avatar>
                      <UserDetails>
                        <UserName>{user.nickname || user.name || '이름 없음'}</UserName>
                        <UserEmail>{user.email}</UserEmail>
                      </UserDetails>
                    </UserInfo>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <StatusBadge $status={user.isActive}>
                      {user.isActive ? '활성' : '비활성'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? formatDate(user.lastLogin) : '정보 없음'}
                  </TableCell>
                  <TableCell>
                    <ActionMenu>
                      <MenuButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === user.id ? null : user.id);
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </MenuButton>
                      {activeMenu === user.id && (
                        <Dropdown>
                          <DropdownItem onClick={() => handleViewUser(user)}>
                            <Eye size={14} />
                            상세보기
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                          >
                            {user.isActive ? (
                              <>
                                <UserX size={14} />
                                비활성화
                              </>
                            ) : (
                              <>
                                <UserCheck size={14} />
                                활성화
                              </>
                            )}
                          </DropdownItem>
                          <DropdownItem
                            $danger
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 size={14} />
                            삭제
                          </DropdownItem>
                        </Dropdown>
                      )}
                    </ActionMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* 페이지네이션 */}
        {!loading && totalElements > 0 && (
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

      {/* 사용자 상세 모달 */}
      {showModal && selectedUser && (
        <ModalOverlay onClick={(e) => {
          if (e.target === e.currentTarget) setShowModal(false);
        }}>
          <Modal>
            <ModalHeader>
              <ModalTitle>사용자 상세 정보</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <AlertCircle size={20} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <DetailRow>
                <DetailLabel>이름</DetailLabel>
                <DetailValue>{selectedUser.nickname || selectedUser.name || '정보 없음'}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>이메일</DetailLabel>
                <DetailValue>{selectedUser.email}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>가입일</DetailLabel>
                <DetailValue>{formatDate(selectedUser.createdAt)}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>마지막 접속</DetailLabel>
                <DetailValue>
                  {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : '정보 없음'}
                </DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>상태</DetailLabel>
                <DetailValue>
                  <StatusBadge $status={selectedUser.isActive}>
                    {selectedUser.isActive ? '활성' : '비활성'}
                  </StatusBadge>
                </DetailValue>
              </DetailRow>
              {selectedUser.region && (
                <DetailRow>
                  <DetailLabel>지역</DetailLabel>
                  <DetailValue>{selectedUser.region}</DetailValue>
                </DetailRow>
              )}
              {selectedUser.phoneNumber && (
                <DetailRow>
                  <DetailLabel>연락처</DetailLabel>
                  <DetailValue>{selectedUser.phoneNumber}</DetailValue>
                </DetailRow>
              )}
            </ModalBody>
          </Modal>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default UserManagement;