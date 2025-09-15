import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { fetchCurrentUserInfo } from '../../api/user';
import MyPageSidebar from '../../components/user/MyPageSidebar';
import ProfileSection from '../../components/user/ProfileSection';
import ScrapSection from '../../components/user/ScrapSection';
import InquirySection from '../../components/user/InquirySection';
import RealtimeChat from '../../components/user/RealtimeChat';

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
    grid-template-columns: 300px 1fr;
  }
`;

const MainContent = styled.div`
  @media(min-width: 1024px) {
    grid-column: span 1;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  color: white;
  font-size: 1.2rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
  color: white;
  text-align: center;
`;

const MyPage = () => {
  const { user, logout } = useAuth();
  const [currentSection, setCurrentSection] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasLoadedRef = useRef(false); // 중복 로드 방지
  const handleSectionChange = (section) => setCurrentSection(section);

  useEffect(() => {
    const loadUserData = async () => {
      // 이미 로드했거나 로딩 중이면 중단
      if (hasLoadedRef.current || loading === false) return;

      // 토큰 확인 - localStorage에서 직접 확인
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        setError('인증 토큰이 없습니다. 다시 로그인해주세요.');
        return;
      }

      try {
        hasLoadedRef.current = true; // 로드 시작 표시
        setLoading(true);
        setError(null);

        const userInfo = await fetchCurrentUserInfo();
        setUserData(userInfo);
      } catch (err) {
        console.error('사용자 정보 로드 실패:', err);

        // 401 에러면 토큰 만료
        if (err.response?.status === 401) {
          setError('로그인이 만료되었습니다. 다시 로그인해주세요.');
          logout();
        } else {
          setError('사용자 정보를 불러오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    // user가 존재할 때만 로드 (단, user 객체 변경으로 인한 재호출 방지)
    if (user && user.username && !hasLoadedRef.current) {
      loadUserData();
    } else if (!user) {
      setLoading(false);
      setError('로그인이 필요합니다.');
    }
  }, [user?.username]); // user 객체 대신 user.username만 의존성으로

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleUserDataUpdate = (updatedData) => {
    setUserData(updatedData);
  };

  const renderCurrentSection = () => {
    if (!userData) return null;

     const token = localStorage.getItem('token');

    switch (currentSection) {
      case 'profile':
        return <ProfileSection userData={userData} onUpdateUser={handleUserDataUpdate} />;
      case 'scraps':
        return <ScrapSection token={token} />;
      case 'inquiries':
        return <InquirySection userId={userData.id} />;
      case 'regionChat':
        return <RealtimeChat userId={userData.id} userNickname={userData.nickname} />;
      default:
        return <ProfileSection userData={userData} onUpdateUser={handleUserDataUpdate} />;
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          사용자 정보를 불러오는 중...
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorContainer>
          <h2 style={{color:'black'}}>오류가 발생했습니다</h2>
          <p style={{color:'black'}}>{error}</p>
          <button
            onClick={() => {
              hasLoadedRef.current = false; // 재로드 허용
              window.location.reload();
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'blue',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            새로고침
          </button>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <MyPageSidebar
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
          isLoggedIn={!!user}       // user가 존재하면 로그인 상태
          userData={userData}       // 사용자 정보
          token={localStorage.getItem("token")}
          setUserData={setUserData}
        />
        <MainContent>
          {renderCurrentSection()}
        </MainContent>
      </ContentWrapper>
    </PageContainer>
  );
};

export default MyPage;