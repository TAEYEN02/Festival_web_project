// src/components/RecentUsers.js
import React from 'react';
import styled from 'styled-components';
import { Users } from 'lucide-react';

const Container = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #111827;
  margin: 0;
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #1d4ed8;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  border-bottom: 1px solid #e5e7eb;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 0.75rem 0;
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 0;
  font-size: 0.875rem;
  color: ${({ $muted }) => ($muted ? '#6b7280' : '#111827')};
  font-weight: ${({ $bold }) => ($bold ? '500' : '400')};
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

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
`;

const RecentUsers = ({ users = [], onViewAll }) => {
  return (
    <Container>
      <Header>
        <Title>최근 가입 사용자</Title>
        <ViewButton onClick={onViewAll}>
          <Users size={16} />
          전체 보기
        </ViewButton>
      </Header>
      
      {users.length > 0 ? (
        <Table>
          <TableHead>
            <tr>
              <TableHeader>이름</TableHeader>
              <TableHeader>이메일</TableHeader>
              <TableHeader>가입일</TableHeader>
              <TableHeader>상태</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell $bold>
                  {user.nickname || user.name || '알 수 없음'}
                </TableCell>
                <TableCell $muted>{user.email}</TableCell>
                <TableCell $muted>
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </TableCell>
                <TableCell>
                  <StatusBadge $status={user.isActive}>
                    {user.isActive ? '활성' : '비활성'}
                  </StatusBadge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState>
          사용자 데이터가 없습니다.
        </EmptyState>
      )}
    </Container>
  );
};

export default RecentUsers;