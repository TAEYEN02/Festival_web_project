// src/components/RecentInquiries.js
import React from 'react';
import styled from 'styled-components';
import { Eye } from 'lucide-react';

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
    if ($status === 'PENDING' || $status === 'pending') {
      return `
        background: #fef3c7;
        color: #92400e;
      `;
    } else if ($status === 'ANSWERED' || $status === 'answered') {
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

const RecentInquiries = ({ inquiries = [], onViewAll }) => {
  return (
    <Container>
      <Header>
        <Title>최근 1:1 문의</Title>
        <ViewButton onClick={onViewAll}>
          <Eye size={16} />
          전체 보기
        </ViewButton>
      </Header>
      
      {inquiries.length > 0 ? (
        <Table>
          <TableHead>
            <tr>
              <TableHeader>문의자</TableHeader>
              <TableHeader>제목</TableHeader>
              <TableHeader>상태</TableHeader>
              <TableHeader>날짜</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {inquiries.map(inquiry => (
              <TableRow key={inquiry.id}>
                <TableCell $bold>
                  {inquiry.userNickname || inquiry.userName || '알 수 없음'}
                </TableCell>
                <TableCell>{inquiry.title}</TableCell>
                <TableCell>
                  <StatusBadge $status={inquiry.status}>
                    {inquiry.status === 'PENDING' ? '대기중' : '답변완료'}
                  </StatusBadge>
                </TableCell>
                <TableCell $muted>
                  {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState>
          문의 데이터가 없습니다.
        </EmptyState>
      )}
    </Container>
  );
};

export default RecentInquiries;