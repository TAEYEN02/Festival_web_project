import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 1rem;
`;

const InfoItem = styled.p`
  & > strong {
    margin-right: 0.5rem;
  }
`;

const ProfileSection = ({ userData }) => {
  if (!userData) return null;

  return (
    <Container>
      <Title>프로필 정보</Title>
      <div>
        <InfoItem><strong>이름:</strong> {userData.username}</InfoItem>
        <InfoItem><strong>닉네임:</strong> {userData.nickname}</InfoItem>
        <InfoItem><strong>이메일:</strong> {userData.email}</InfoItem>
        <InfoItem><strong>전화번호:</strong> {userData.phone}</InfoItem>
        <InfoItem><strong>가입일:</strong> {userData.joinDate}</InfoItem>
        <InfoItem><strong>스크랩 수:</strong> {userData.totalScraps}</InfoItem>
        <InfoItem><strong>문의 수:</strong> {userData.totalInquiries}</InfoItem>
      </div>
    </Container>
  );
};

export default ProfileSection;