// RecentUsers.js
import React from 'react';
import styled from 'styled-components';
import { Users } from 'lucide-react';

const Container = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
`;

const ViewAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(to right, #6366f1, #a855f7);
  color: white;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    box-shadow: 0 5px 15px rgba(99,102,241,0.3);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: ${({ muted }) => (muted ? '#6b7280' : '#1f2937')};
  font-weight: ${({ bold }) => (bold ? 500 : 400)};
  font-family: ${({ mono }) => (mono ? 'monospace' : 'inherit')};
`;

const ActionButton = styled.button`
  font-size: 0.875rem;
  font-weight: 500;
  margin-right: ${({ mr }) => (mr ? '0.75rem' : 0)};
  color: ${({ color }) => color};
  background: transparent;
  border: none;
  cursor: pointer;
  &:hover {
    color: ${({ hoverColor }) => hoverColor};
  }
`;

const RecentUsers = () => {
  const users = [
    { id: 'USR-2024-101', name: '최준호', email: 'junho.choi@email.com', date: '2024-01-15', status: 'active' },
    { id: 'USR-2024-102', name: '한지민', email: 'jimin.han@email.com', date: '2024-01-14', status: 'active' },
    { id: 'USR-2024-103', name: '오세훈', email: 'sehoon.oh@email.com', date: '2024-01-13', status: 'active' }
  ];

  return (
    <Container>
      <Header>
        <Title>최근 가입 사용자</Title>
        <ViewAllButton>
          <Users size={16} />
          전체 보기
        </ViewAllButton>
      </Header>
      <Table>
        <thead>
          <tr>
            <Th>사용자 ID</Th>
            <Th>이름</Th>
            <Th>이메일</Th>
            <Th>가입일</Th>
            <Th>작업</Th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <Td mono>{user.id}</Td>
              <Td bold>{user.name}</Td>
              <Td muted>{user.email}</Td>
              <Td muted>{user.date}</Td>
              <Td>
                <ActionButton mr color="#4f46e5" hoverColor="#4338ca">상세</ActionButton>
                <ActionButton color="#dc2626" hoverColor="#b91c1c">비활성화</ActionButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default RecentUsers;
