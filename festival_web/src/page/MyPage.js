import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import MyPageSidebar from '../components/MyPageSidebar';
import ProfileSection from '../components/ProfileSection';
import ScrapSection from '../components/ScrapSection';
import InquirySection from '../components/InquirySection';
import axios from 'axios';
import RealtimeChat from '../components/RealtimeChat';

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media(min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const MainContent = styled.div`
  @media(min-width: 1024px) {
    grid-column: span 3;
  }
`;

const MyPage = () => {
  const [userData, setUserData] = useState(null);
  const [currentSection, setCurrentSection] = useState('profile');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    axios.get('http://localhost:8081/api/user/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUserData(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'profile':
        return <ProfileSection userData={userData} />;
      case 'scraps':
        return <ScrapSection userData={userData} />;
      case 'inquiries':
        return <InquirySection userData={userData} />;
      case 'chat': // 새로운 섹션
        return <RealtimeChat regionCode="seoul" regionName="서울" />;
      default:
        return <ProfileSection userData={userData} />;
    }
  };

  if (!userData) return <div>Loading...</div>;

  return (
    <PageContainer>
      <ContentWrapper>
        <MyPageSidebar
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          isLoggedIn={!!userData}
          userData={userData}
          onLogout={handleLogout} // 로그아웃 핸들러 연결
        />
        <MainContent>{renderCurrentSection()}</MainContent>
      </ContentWrapper>
    </PageContainer>
  );
};

export default MyPage;