// src/components/UserManagement.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Filter, Download, Eye, UserX, UserCheck, MoreHorizontal } from 'lucide-react';
import { fetchUsers, toggleUserStatus } from '../../api/admin';

const Container = styled.div`
  padding: 1.5rem;
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
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
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
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: #2563eb;
          color: white;
          border: none;
          &:hover { background: #1d4ed8; }
        `;
      case 'secondary':
        return `
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          &:hover { background: #f9fafb; }
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
          border: none;
          &:hover { background: #e5e7eb; }
        `;
    }
  }}
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
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
  min-width: 200px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  
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
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f9fafb;
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
  transition: background-color 0.2s;
  
  &:hover {
    background: #f9fafb;
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
  font-weight: 500;
  color: #111827;
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
        background: #d1fae5;
        color: #065f46;
      `;
    } else {
      return `
        background: #fecaca;
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
  min-width: 150px;
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
  
  &:hover {
    background: #f9fafb;
  }
  
  &:first-child {
    border-top: none;
  }
  
  ${({ $danger }) => $danger && `
    color: #dc2626;
    &:hover {
      background: #fef2f2;
    }
  `}
`;

const Pagination = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
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
  
  &:hover:not(:disabled) {
    background: ${({ $active }) => ($active ? '#1d4ed8' : '#f9fafb')};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState(null);

  const pageSize = 10;

  useEffect(() => {
    loadUsers();
  }, [page, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const isActiveFilter = statusFilter === 'all' ? null : statusFilter === 'active';
      const response = await fetchUsers(page, pageSize, isActiveFilter);
      
      setUsers(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId);
      // 상태 변경 후 목록 새로고침
      loadUsers();
    } catch (error) {
      console.error('사용자 상태 변경 실패:', error);
      alert('사용자 상태 변경에 실패했습니다.');
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadUsers();
  };

  const filteredUsers = users.filter(user =>
    user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>사용자 관리</Title>
          <Subtitle>등록된 사용자들을 관리하고 모니터링합니다</Subtitle>
        </HeaderLeft>
        <HeaderActions>
          <ActionButton $variant="secondary">
            <Download size={16} />
            내보내기
          </ActionButton>
          <ActionButton $variant="primary">
            <Filter size={16} />
            고급 필터
          </ActionButton>
        </HeaderActions>
      </Header>

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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </SearchContainer>
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
                  <LoadingState>데이터를 불러오는 중...</LoadingState>
                </TableCell>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <TableCell colSpan={5}>
                  <EmptyState>표시할 사용자가 없습니다.</EmptyState>
                </TableCell>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <UserInfo>
                      <Avatar>{getInitials(user.nickname || user.name)}</Avatar>
                      <UserDetails>
                        <UserName>{user.nickname || user.name}</UserName>
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
                        onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                      >
                        <MoreHorizontal size={16} />
                      </MenuButton>
                      {activeMenu === user.id && (
                        <Dropdown>
                          <DropdownItem>
                            <Eye size={14} />
                            상세 보기
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
                        </Dropdown>
                      )}
                    </ActionMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {!loading && totalElements > 0 && (
          <Pagination>
            <PaginationInfo>
              {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalElements)} / {totalElements}개
            </PaginationInfo>
            <PaginationButtons>
              <PageButton
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                이전
              </PageButton>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.floor(page / 5) * 5 + i;
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
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                다음
              </PageButton>
            </PaginationButtons>
          </Pagination>
        )}
      </TableContainer>
    </Container>
  );
};

export default UserManagement;