import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    padding: 0.5rem 1rem;
    text-align: left;
  }

  th {
    border-bottom: 1px solid #e5e7eb;
  }

  tbody tr {
    border-bottom: 1px solid #f3f4f6;
    &:hover {
      background-color: #f9fafb;
    }
  }
`;

const InquirySection = ({ userId }) => {
  const dummyInquiries = [
    { id: 'INQ-001', title: '예약 관련 문의', status: '대기중', date: '2024-01-10' },
    { id: 'INQ-002', title: '결제 오류 문의', status: '답변완료', date: '2024-01-12' },
    { id: 'INQ-003', title: '회원정보 수정', status: '답변완료', date: '2024-01-15' },
  ];

  return (
    <Card>
      <h2>문의 내역</h2>
      <Table>
        <thead>
          <tr>
            <th>문의 번호</th>
            <th>제목</th>
            <th>상태</th>
            <th>날짜</th>
          </tr>
        </thead>
        <tbody>
          {dummyInquiries.map(inq => (
            <tr key={inq.id}>
              <td>{inq.id}</td>
              <td>{inq.title}</td>
              <td>{inq.status}</td>
              <td>{inq.date}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default InquirySection;
