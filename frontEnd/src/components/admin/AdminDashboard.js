import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import StatsCards from './StatsCards';
import RecentInquiries from './RecentInquiries';
import RecentUsers from './RecentUsers';
import ChartSection from './ChartSection';
import { fetchDashboardStats, fetchUsers } from '../../api/admin';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
  color: #1f2937;
`;

const Main = styled.main`
  flex: 1;
  padding: 1rem;
  transition: all 0.3s ease;

  @media(min-width: 1024px) {
    margin-left: ${({ $sidebarOpen }) => ($sidebarOpen ? "18rem" : "0")};
    padding: 2rem;
  }
`;

const SectionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const AdminDashboard = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 1247,
        pendingInquiries: 23,
        activeFestivals: 89,
        activeChatUsers: 156
    });

    const [dashboardStats, setDashboardStats] = useState(null);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const stats = await fetchDashboardStats();
                setDashboardStats(stats);
            } catch (err) {
                console.error(err);
            }
        };

        const loadUsers = async () => {
            try {
                const users = await fetchUsers(0, 10);
                setUsers(users);
            } catch (err) {
                console.error(err);
            }
        };

        loadStats();
        loadUsers();
    }, []);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setSidebarOpen(false);
    };

    const handleLogout = () => {
        // JWT 삭제
        localStorage.removeItem('token');
        // 인증 상태 false
        setIsLoggedIn(false);
        // 유저 초기화 (선택)
        setCurrentPage('dashboard');
        // 로그인 페이지로 이동
        window.location.href = '/login';
    };

    return (
        <Container>
            <Sidebar
                currentPage={currentPage}
                onPageChange={handlePageChange}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                onLogout={handleLogout}
            />

            <Main $sidebarOpen={sidebarOpen}>
                <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
                <SectionGroup>
                    <StatsCards stats={stats} />
                    <RecentInquiries />
                    <RecentUsers />
                    <ChartSection />
                </SectionGroup>
            </Main>
        </Container>
    );
};

export default AdminDashboard;
