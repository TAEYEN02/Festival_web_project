// RecentInquiries.jsx
import React from 'react';
import styled from 'styled-components';
import { Eye } from 'lucide-react';

const Container = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1F2937;
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(to right, #6366F1, #8B5CF6);
  color: #fff;
  border-radius: 0.5rem;
  &:hover {
    box-shadow: 0 5px 15px rgba(99,102,241,0.4);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #E5E7EB;
`;

const Td = styled.td`
  padding: 0.75rem;
  font-size: 0.875rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.status === 'pending' ? '#B45309' : '#047857'};
  background: ${props => props.status === 'pending' ? '#FEF3C7' : '#D1FAE5'};
`;

const RecentInquiries = () => {
  const inquiries = [
    { id: 'INQ-2024-001', user: '김철수', title: '축제 예매 관련 문의', category: '결제', status: 'pending', date: '2024-01-15' },
    { id: 'INQ-2024-002', user: '박영희', title: '회원정보 수정 오류', category: '기술', status: 'answered', date: '2024-01-14' },
    { id: 'INQ-2024-003', user: '이민수', title: '축제 정보 오류 신고', category: '일반', status: 'pending', date: '2024-01-13' }
  ];

  return (
    <Container>
      <Header>
        <Title>최근 1:1 문의</Title>
        <ViewButton>
          <Eye className="w-4 h-4" /> 전체 보기
        </ViewButton>
      </Header>
      <Table>
        <thead>
          <tr>
            <Th>문의 번호</Th>
            <Th>사용자</Th>
            <Th>제목</Th>
            <Th>상태</Th>
            <Th>작업</Th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map(inq => (
            <tr key={inq.id}>
              <Td>{inq.id}</Td>
              <Td>{inq.user}</Td>
              <Td>{inq.title}</Td>
              <Td><StatusBadge status={inq.status}>{inq.status === 'pending' ? '대기중' : '답변완료'}</StatusBadge></Td>
              <Td><button>{inq.status === 'pending' ? '답변하기' : '보기'}</button></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default RecentInquiries;
