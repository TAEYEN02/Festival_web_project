import { useState } from 'react';
import styled from 'styled-components';
import MyPageSidebar from '../components/MyPageSidebar';
import ProfileSection from '../components/ProfileSection';
import ScrapSection from '../components/ScrapSection';
import InquirySection from '../components/InquirySection';

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

const MyPage = ({ userData }) => {
  const [currentSection, setCurrentSection] = useState('profile');

  const handleLogout = () => {
    localStorage.removeItem('token'); // JWT 삭제
    window.location.href = '/login';   // 로그인 페이지로 이동
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'profile': return <ProfileSection userData={userData} />;
      case 'scraps': return <ScrapSection userId={userData.id} />;
      case 'inquiries': return <InquirySection userId={userData.id} />;
      default: return <ProfileSection userData={userData} />;
    }
  };

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