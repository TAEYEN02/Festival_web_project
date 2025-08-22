// src/components/AdminDashboard.js
import { useState, useEffect } from 'react';
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

const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('대시보드 데이터 로딩 시작...');
      
      // 병렬로 데이터 로드 - 개별 에러는 각 함수에서 처리됨
      const [statsData, usersData, inquiriesData] = await Promise.allSettled([
        fetchDashboardStats(),
        fetchUsers(0, 5),
        fetchInquiries(0, 5)
      ]);

      console.log('API 호출 결과:', {
        stats: statsData.status,
        users: usersData.status,
        inquiries: inquiriesData.status
      });

      // 성공한 데이터만 설정 (실패해도 더미 데이터가 반환됨)
      if (statsData.status === 'fulfilled') {
        setDashboardStats(statsData.value);
        console.log('Stats 데이터 설정:', statsData.value);
      }
      if (usersData.status === 'fulfilled') {
        setRecentUsers(usersData.value.content || []);
        console.log('Users 데이터 설정:', usersData.value.content?.length || 0, '개');
      }
      if (inquiriesData.status === 'fulfilled') {
        setRecentInquiries(inquiriesData.value.content || []);
        console.log('Inquiries 데이터 설정:', inquiriesData.value.content?.length || 0, '개');
      }
      
      console.log('대시보드 데이터 로딩 완료');
      
    } catch (err) {
      console.warn('Dashboard load warning:', err);
      // 모든 API가 더미 데이터를 반환하므로 여기서는 에러 처리하지 않음
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
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

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <ContentSection>
            <ConnectionTest />
            <StatsCards stats={dashboardStats} />
            
            <ContentGrid>
              <RecentInquiries inquiries={recentInquiries} onViewAll={() => handleViewAll('inquiries')} />
              <RecentUsers users={recentUsers} onViewAll={() => handleViewAll('users')} />
            </ContentGrid>
            
            <ChartSection />
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
        <TopBar stats={dashboardStats} />
        {renderContent()}
      </Main>
    </Container>
  );
};

export default AdminDashboard;