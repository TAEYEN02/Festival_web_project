import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import {
    BarChart3, TrendingUp, Users, MessageSquare, Calendar, Download,
    RefreshCw, Filter, DateRange, PieChart, LineChart, Activity,
    AlertCircle, CheckCircle, Clock, ArrowUp, ArrowDown, MapPin 
} from 'lucide-react';
import {
    LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart,
    Cell, Area, AreaChart
} from 'recharts';
import * as adminAPI from '../../api/admin';

// Styled Components
const Container = styled.div`
  padding: 1.5rem;
  min-height: 100vh;
  background: #f8fafc;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media(max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${({ $variant }) => {
        switch ($variant) {
            case 'primary':
                return `
          background: #2563eb;
          color: white;
          &:hover { background: #1d4ed8; transform: translateY(-1px); }
        `;
            case 'secondary':
                return `
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          &:hover { background: #f9fafb; transform: translateY(-1px); }
        `;
            default:
                return `
          background: #f3f4f6;
          color: #374151;
          &:hover { background: #e5e7eb; transform: translateY(-1px); }
        `;
        }
    }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  min-width: 140px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const DateInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatInfo = styled.div``;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const StatIcon = styled.div`
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: ${({ $color }) => {
        switch ($color) {
            case 'blue': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
            case 'green': return 'linear-gradient(135deg, #10b981, #059669)';
            case 'purple': return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
            case 'orange': return 'linear-gradient(135deg, #f59e0b, #d97706)';
            default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
        }
    }};
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

const StatFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
`;

const ChangeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? '#059669' : '#dc2626')};
`;

const ChangeText = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media(min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  
  ${({ $fullWidth }) => $fullWidth && `
    grid-column: 1 / -1;
  `}
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0 0 1rem 0;
`;

const ChartSubtitle = styled.p`
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #6b7280;
  gap: 0.5rem;
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #dc2626;
  text-align: center;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  border-bottom: 1px solid #e5e7eb;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #f3f4f6;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #374151;
`;

// 차트 색상 팔레트
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const ReportsAndStats = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [dateRange, setDateRange] = useState('30');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportType, setReportType] = useState('all');

    // 통계 데이터
    const [userStats, setUserStats] = useState({
        total: 0,
        growth: 0,
        activeToday: 0,
        newThisMonth: 0
    });

    const [inquiryStats, setInquiryStats] = useState({
        total: 0,
        pending: 0,
        answered: 0,
        avgResponseTime: 0
    });

    const [chatStats, setChatStats] = useState({
        totalMessages: 0,
        activeRooms: 0,
        activeUsers: 0,
        avgMessagesPerUser: 0
    });

    // 차트 데이터
    const [userGrowthData, setUserGrowthData] = useState([]);
    const [inquiryTrendData, setInquiryTrendData] = useState([]);
    const [chatActivityData, setChatActivityData] = useState([]);
    const [regionalData, setRegionalData] = useState([]);

    // 데이터 로드 함수
    const loadAllStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const days = parseInt(dateRange) || 30;

            // 병렬로 모든 통계 데이터 로드
            const [
                dashboardData,
                userGrowth,
                inquiryTrend,
                chatActivity,
                regionalStats
            ] = await Promise.all([
                adminAPI.fetchDashboardStats(),
                adminAPI.fetchUserGrowthStats(days),
                adminAPI.fetchInquiryStats(days),
                adminAPI.fetchRegionalChatStats(),
                adminAPI.fetchRegionalChatStats()
            ]);

            // 사용자 통계 설정
            setUserStats({
                total: dashboardData.totalUsers || 0,
                growth: calculateGrowthRate(userGrowth),
                activeToday: dashboardData.activeChatUsers || 0,
                newThisMonth: dashboardData.newUsersThisMonth || 0
            });

            // 문의 통계 설정
            setInquiryStats({
                total: dashboardData.totalInquiries || 0,
                pending: dashboardData.pendingInquiries || 0,
                answered: dashboardData.answeredInquiries || 0,
                avgResponseTime: inquiryTrend.avgResponseTime || 0
            });

            // 채팅 통계 설정
            const totalMessages = regionalStats.reduce((sum, region) => sum + (region.messageCount || 0), 0);
            const totalActiveUsers = regionalStats.reduce((sum, region) => sum + (region.activeUsers || 0), 0);

            setChatStats({
                totalMessages,
                activeRooms: regionalStats.length,
                activeUsers: totalActiveUsers,
                avgMessagesPerUser: totalActiveUsers > 0 ? Math.round(totalMessages / totalActiveUsers) : 0
            });

            // 차트 데이터 설정
            setUserGrowthData(userGrowth || []);
            setInquiryTrendData(inquiryTrend.data || []);
            setChatActivityData(formatChatActivityData(chatActivity));
            setRegionalData(regionalStats || []);

        } catch (error) {
            console.error('통계 데이터 로드 실패:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    // 성장률 계산 함수
    const calculateGrowthRate = (data) => {
        if (!data || data.length < 2) return 0;

        const firstValue = data[0].newUsers || 0;
        const lastValue = data[data.length - 1].newUsers || 0;

        if (firstValue === 0) return 100;
        return Math.round(((lastValue - firstValue) / firstValue) * 100);
    };

    // 채팅 활동 데이터 포맷팅
    const formatChatActivityData = (data) => {
        // 시간대별 채팅 활동 데이터 생성 (더미 데이터)
        const hours = Array.from({ length: 24 }, (_, i) => ({
            hour: `${i}:00`,
            messages: Math.floor(Math.random() * 100) + 20,
            users: Math.floor(Math.random() * 50) + 10
        }));
        return hours;
    };

    // 새로고침
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await loadAllStats();
        } finally {
            setRefreshing(false);
        }
    };

    // 리포트 다운로드
    const handleDownloadReport = async () => {
        try {
            await adminAPI.exportData('full_report', 'excel', {
                dateRange,
                startDate,
                endDate,
                type: reportType
            });
        } catch (error) {
            console.error('리포트 다운로드 실패:', error);
            alert('리포트 다운로드에 실패했습니다.');
        }
    };

    // 초기 로드
    useEffect(() => {
        loadAllStats();
    }, [loadAllStats]);

    // 날짜 범위 변경시 자동 새로고침
    useEffect(() => {
        const today = new Date();
        const pastDate = new Date(today.getTime() - parseInt(dateRange) * 24 * 60 * 60 * 1000);

        setStartDate(pastDate.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
    }, [dateRange]);

    if (error) {
        return (
            <Container>
                <ErrorState>
                    <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3>데이터 로드 오류</h3>
                    <p>{error}</p>
                    <ActionButton $variant="primary" onClick={() => window.location.reload()}>
                        페이지 새로고침
                    </ActionButton>
                </ErrorState>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <HeaderLeft>
                    <Title>통계 및 리포트</Title>
                    <Subtitle>플랫폼의 전반적인 성과를 분석하고 리포트를 생성합니다</Subtitle>
                </HeaderLeft>
                <HeaderActions>
                    <ActionButton onClick={handleDownloadReport} disabled={loading}>
                        <Download size={16} />
                        리포트 다운로드
                    </ActionButton>
                    <ActionButton $variant="primary" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                        새로고침
                    </ActionButton>
                </HeaderActions>
            </Header>

            {/* 필터 섹션 */}
            <FilterSection>
                <FilterRow>
                    <FilterGroup>
                        <FilterLabel>기간 선택</FilterLabel>
                        <Select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="7">최근 7일</option>
                            <option value="30">최근 30일</option>
                            <option value="90">최근 90일</option>
                            <option value="365">최근 1년</option>
                        </Select>
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel>시작일</FilterLabel>
                        <DateInput
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel>종료일</FilterLabel>
                        <DateInput
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </FilterGroup>

                    <FilterGroup>
                        <FilterLabel>리포트 유형</FilterLabel>
                        <Select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            <option value="all">전체</option>
                            <option value="users">사용자</option>
                            <option value="inquiries">문의</option>
                            <option value="chat">채팅</option>
                        </Select>
                    </FilterGroup>
                </FilterRow>
            </FilterSection>

            {/* 주요 통계 카드 */}
            <StatsGrid>
                <StatCard>
                    <StatHeader>
                        <StatInfo>
                            <StatValue>{userStats.total.toLocaleString()}</StatValue>
                            <StatLabel>전체 사용자</StatLabel>
                        </StatInfo>
                        <StatIcon $color="blue">
                            <Users size={24} />
                        </StatIcon>
                    </StatHeader>
                    <StatFooter>
                        <ChangeIndicator $positive={userStats.growth >= 0}>
                            {userStats.growth >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                            {Math.abs(userStats.growth)}%
                        </ChangeIndicator>
                        <ChangeText>지난 {dateRange}일 대비</ChangeText>
                    </StatFooter>
                </StatCard>

                <StatCard>
                    <StatHeader>
                        <StatInfo>
                            <StatValue>{inquiryStats.total.toLocaleString()}</StatValue>
                            <StatLabel>총 문의</StatLabel>
                        </StatInfo>
                        <StatIcon $color="green">
                            <MessageSquare size={24} />
                        </StatIcon>
                    </StatHeader>
                    <StatFooter>
                        <ChangeIndicator $positive={true}>
                            <CheckCircle size={16} />
                            {((inquiryStats.answered / inquiryStats.total) * 100 || 0).toFixed(1)}%
                        </ChangeIndicator>
                        <ChangeText>답변 완료율</ChangeText>
                    </StatFooter>
                </StatCard>

                <StatCard>
                    <StatHeader>
                        <StatInfo>
                            <StatValue>{chatStats.totalMessages.toLocaleString()}</StatValue>
                            <StatLabel>총 채팅 메시지</StatLabel>
                        </StatInfo>
                        <StatIcon $color="purple">
                            <Activity size={24} />
                        </StatIcon>
                    </StatHeader>
                    <StatFooter>
                        <ChangeIndicator $positive={true}>
                            <TrendingUp size={16} />
                            {chatStats.avgMessagesPerUser}
                        </ChangeIndicator>
                        <ChangeText>사용자당 평균 메시지</ChangeText>
                    </StatFooter>
                </StatCard>

                <StatCard>
                    <StatHeader>
                        <StatInfo>
                            <StatValue>{inquiryStats.avgResponseTime.toFixed(1)}h</StatValue>
                            <StatLabel>평균 응답 시간</StatLabel>
                        </StatInfo>
                        <StatIcon $color="orange">
                            <Clock size={24} />
                        </StatIcon>
                    </StatHeader>
                    <StatFooter>
                        <ChangeIndicator $positive={inquiryStats.avgResponseTime < 24}>
                            <Activity size={16} />
                            {inquiryStats.pending}
                        </ChangeIndicator>
                        <ChangeText>대기중인 문의</ChangeText>
                    </StatFooter>
                </StatCard>
            </StatsGrid>

            {/* 차트 섹션 */}
            <ChartsGrid>
                {/* 사용자 증가 차트 */}
                <ChartCard>
                    <ChartTitle>사용자 증가 추이</ChartTitle>
                    <ChartSubtitle>일별 신규 사용자 가입 현황</ChartSubtitle>
                    {loading ? (
                        <LoadingState>
                            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                            데이터 로딩중...
                        </LoadingState>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={userGrowthData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="newUsers" stroke={COLORS[0]} fill={COLORS[0]} opacity={0.3} />
                                <Area type="monotone" dataKey="userCount" stroke={COLORS[1]} fill={COLORS[1]} opacity={0.3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                {/* 문의 처리 현황 */}
                <ChartCard>
                    <ChartTitle>문의 처리 현황</ChartTitle>
                    <ChartSubtitle>일별 문의 접수 및 처리 현황</ChartSubtitle>
                    {loading ? (
                        <LoadingState>
                            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                            데이터 로딩중...
                        </LoadingState>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={inquiryTrendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="received" fill={COLORS[2]} />
                                <Bar dataKey="answered" fill={COLORS[1]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>

                {/* 시간대별 채팅 활동 */}
                <ChartCard $fullWidth>
                    <ChartTitle>시간대별 채팅 활동</ChartTitle>
                    <ChartSubtitle>24시간 동안의 채팅 메시지 및 활성 사용자 현황</ChartSubtitle>
                    {loading ? (
                        <LoadingState>
                            <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                            데이터 로딩중...
                        </LoadingState>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsLineChart data={chatActivityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="messages" stroke={COLORS[3]} strokeWidth={2} />
                                <Line type="monotone" dataKey="users" stroke={COLORS[4]} strokeWidth={2} />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    )}
                </ChartCard>
            </ChartsGrid>

            {/* 지역별 활동 현황 테이블 */}
            <TableContainer>
                <ChartTitle style={{ padding: '1.5rem 1.5rem 0' }}>지역별 활동 현황</ChartTitle>
                <Table>
                    <TableHeader>
                        <tr>
                            <TableHeaderCell>지역</TableHeaderCell>
                            <TableHeaderCell>활성 사용자</TableHeaderCell>
                            <TableHeaderCell>총 메시지</TableHeaderCell>
                            <TableHeaderCell>평균 메시지/사용자</TableHeaderCell>
                            <TableHeaderCell>활동 지수</TableHeaderCell>
                        </tr>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <tr>
                                <TableCell colSpan={5}>
                                    <LoadingState style={{ height: '200px' }}>
                                        <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                        데이터 로딩중...
                                    </LoadingState>
                                </TableCell>
                            </tr>
                        ) : (
                            regionalData
                                .sort((a, b) => (b.activeUsers || 0) - (a.activeUsers || 0))
                                .map((region, index) => {
                                    const avgMessages = region.activeUsers > 0
                                        ? Math.round(region.messageCount / region.activeUsers)
                                        : 0;
                                    const activityIndex = Math.round(((region.activeUsers || 0) + avgMessages) / 10);

                                    return (
                                        <TableRow key={region.region || index}>
                                            <TableCell>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <MapPin size={16} color="#6b7280" />
                                                    {region.region || '지역 정보 없음'}
                                                </div>
                                            </TableCell>
                                            <TableCell>{(region.activeUsers || 0).toLocaleString()}</TableCell>
                                            <TableCell>{(region.messageCount || 0).toLocaleString()}</TableCell>
                                            <TableCell>{avgMessages.toLocaleString()}</TableCell>
                                            <TableCell>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div
                                                        style={{
                                                            width: '60px',
                                                            height: '8px',
                                                            background: '#e5e7eb',
                                                            borderRadius: '4px',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: `${Math.min(activityIndex * 10, 100)}%`,
                                                                height: '100%',
                                                                background: activityIndex > 7 ? '#10b981' : activityIndex > 4 ? '#f59e0b' : '#ef4444',
                                                                borderRadius: '4px'
                                                            }}
                                                        />
                                                    </div>
                                                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                        {activityIndex}/10
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default ReportsAndStats;