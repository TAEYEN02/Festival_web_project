// src/components/AdminDashboard.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import StatsCards from './StatsCards';
import RecentInquiries from './RecentInquiries';
import RecentUsers from './RecentUsers';
import ChartSection from './ChartSection';
import ConnectionTest from './ConnectionTest';

// 페이지 컴포넌트들
import UserManagement from './UserManagement';
import InquiryManagement from './InquiryManagement';
import ChatManagement from './ChatManagement';
import SystemSettings from './SystemSettings';

import { fetchDashboardStats, fetchUsers, fetchInquiries } from '../../api/admin';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  background: #f8fafc;
  color: #1f2937;
`;

const Main = styled.main`
  flex: 1;
  margin-left: 18rem; /* 사이드바 항상 표시 */
  transition: all 0.3s ease;
`;

const ContentSection = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media(min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingContent = styled.div`
  text-align: center;
`;

const Spinner = styled.div`
  width: 3rem;
  height: 3rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem;
  color: #dc2626;
`;

const regionIdMapping = {
  'seoul': '서울',
  'busan': '부산',
  'daegu': '대구',
  'incheon': '인천',
  'gwangju': '광주',
  'daejeon': '대전',
  'ulsan': '울산',
  'gyeonggi': '경기',
  'gangwon': '강원',
  'north-chungcheong': '충북',
  'south-chungcheong': '충남',
  'north-jeolla': '전북',
  'south-jeolla': '전남',
  'north-gyeongsang': '경북',
  'south-gyeongsang': '경남',
  'jeju': '제주'
};


const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [regionData, setRegionData] = useState([]);

  // Dashboard Data
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    pendingInquiries: 0,
    activeFestivals: 0,
    activeChatUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentInquiries, setRecentInquiries] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token'); // JWT 토큰 포함 필요
        const growthRes = await axios.get('/api/admin/stats/user-growth', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const regionRes = await axios.get('/api/admin/stats/regional-chat', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setGrowthData(growthRes.data);

        // 여기서 regionData 매핑
        const formattedRegionData = regionRes.data.map(r => ({
          region: r.region,                  // 실제 key (ex: seoul)
          regionName: regionIdMapping[r.region] || r.region, // 표시용
          messageCount: r.messageCount,
          activeUsers: r.activeUsers,
          todayMessages: r.todayMessages
        }));
        setRegionData(formattedRegionData);
      } catch (err) {
        console.error('차트 데이터 로딩 실패:', err);
        setError('차트 데이터를 불러오지 못했습니다.');
      }
    };

    fetchData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('대시보드 데이터 로딩 시작...');

      // 1. 먼저 대시보드 통계 로드 (가장 중요)
      let statsData = null;
      try {
        statsData = await fetchDashboardStats();
        setDashboardStats(statsData);
        console.log('Stats 데이터 로드 성공:', statsData);
      } catch (statsError) {
        console.warn('Stats 데이터 로드 실패:', statsError);
        // 기본값 유지
      }

      // 2. 최근 사용자 로드 (실패해도 계속 진행)
      let usersData = [];
      try {
        const usersResponse = await fetchUsers(0, 5);
        if (usersResponse && usersResponse.content) {
          usersData = usersResponse.content;
          setRecentUsers(usersData);
          console.log('Users 데이터 로드 성공:', usersData.length, '개');
        }
      } catch (usersError) {
        console.warn('Users 데이터 로드 실패:', usersError);
        setRecentUsers([]);
      }

      // 3. 최근 문의 로드 (실패해도 계속 진행)
      let inquiriesData = [];
      try {
        const inquiriesResponse = await fetchInquiries(0, 5);
        if (inquiriesResponse && inquiriesResponse.content) {
          inquiriesData = inquiriesResponse.content;
          setRecentInquiries(inquiriesData);
          console.log('Inquiries 데이터 로드 성공:', inquiriesData.length, '개');
        }
      } catch (inquiriesError) {
        console.warn('Inquiries 데이터 로드 실패:', inquiriesError);
        setRecentInquiries([]);
      }

      console.log('대시보드 데이터 로딩 완료');

    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLogout = () => {
    // 토큰 제거
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    // 로그인 페이지로 리다이렉트
    window.location.href = '/login';
  };

  const handleViewAll = (type) => {
    if (type === 'users') {
      setCurrentPage('users');
    } else if (type === 'inquiries') {
      setCurrentPage('inquiries');
    } else if (type === 'chat') {
      setCurrentPage('chat');
    }
  };

  // 전체 대시보드 새로고침
  const handleRefresh = async () => {
    await loadDashboardData();
  };

  // 로딩 상태
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingContent>
          <Spinner />
          <p style={{ color: '#6b7280' }}>데이터를 불러오는 중...</p>
        </LoadingContent>
      </LoadingContainer>
    );
  }

  // 에러 상태 (치명적인 에러만 표시)
  if (error) {
    return (
      <Container>
        <Sidebar
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onLogout={handleLogout}
        />
        <Main>
          <TopBar stats={dashboardStats} onRefresh={handleRefresh} />
          <ContentSection>
            <ErrorContainer>
              <h3>오류 발생</h3>
              <p>{error}</p>
              <button
                onClick={handleRefresh}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem'
                }}
              >
                다시 시도
              </button>
            </ErrorContainer>
          </ContentSection>
        </Main>
      </Container>
    );
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <ContentSection>
            <ConnectionTest />
            <StatsCards stats={dashboardStats} />

            <ContentGrid>
              <RecentInquiries
                inquiries={recentInquiries}
                onViewAll={() => handleViewAll('inquiries')}
              />
              <RecentUsers
                users={recentUsers}
                onViewAll={() => handleViewAll('users')}
              />
            </ContentGrid>

            <ChartSection
              growthData={growthData}
              regionData={regionData}  // 이미 매핑된 formattedRegionData
            />
          </ContentSection>
        );
      case 'users':
        return <UserManagement />;
      case 'inquiries':
        return <InquiryManagement />;
      case 'chat':
        return <ChatManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return (
          <ContentSection>
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <h3>페이지를 준비 중입니다</h3>
              <p>곧 업데이트 예정입니다.</p>
            </div>
          </ContentSection>
        );
    }
  };

  return (
    <Container>
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onLogout={handleLogout}
      />

      <Main>
        <TopBar
          stats={dashboardStats}
          onRefresh={handleRefresh}
        />
        {renderContent()}
      </Main>
    </Container>
  );
};

export default AdminDashboard;