import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  MessageCircle, Users, MapPin, Activity, AlertTriangle, 
  Search, Filter, Eye, Trash2, Ban, CheckCircle, MoreHorizontal,
  RefreshCw, Download, Shield, Clock
} from 'lucide-react';
import * as adminAPI from '../../api/admin';

// Styled Components (기존과 동일한 스타일 유지)
const Container = styled.div`
  padding: 1.5rem;
  min-height: 100vh;
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
      case 'danger':
        return `
          background: #dc2626;
          color: white;
          &:hover { background: #b91c1c; transform: translateY(-1px); }
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
`;

const StatIcon = styled.div`
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: ${({ $color }) => {
    switch ($color) {
      case 'blue': return 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
      case 'green': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'purple': return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
      case 'red': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  }};
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

const StatInfo = styled.div``;

const StatValue = styled.div`
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const TabContainer = styled.div`
  background: white;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const TabHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  font-weight: 500;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  
  ${({ $active }) => $active && `
    color: #2563eb;
    border-bottom-color: #2563eb;
    background: white;
  `}
  
  &:hover {
    background: ${({ $active }) => $active ? 'white' : '#f3f4f6'};
  }
`;

const TabContent = styled.div`
  padding: 1.5rem;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const RegionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const RegionCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  
  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const RegionHeader = styled.div`
  padding: 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RegionName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RegionActions = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const RegionActionButton = styled.button`
  padding: 0.375rem;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  ${({ $danger }) => $danger && `
    &:hover {
      background: #fef2f2;
      color: #dc2626;
    }
  `}
`;

const RegionStats = styled.div`
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const RegionStat = styled.div`
  text-align: center;
`;

const RegionStatValue = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
`;

const RegionStatLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const MessageTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  border-bottom: 1px solid #e5e7eb;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f8fafc;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem;
  font-size: 0.875rem;
  vertical-align: middle;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserAvatar = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
`;

const MessageContent = styled.div`
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #374151;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${({ $status }) => {
    switch ($status) {
      case 'active':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case 'blocked':
        return `
          background: #fecaca;
          color: #991b1b;
        `;
      case 'reported':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #dc2626;
  background: #fef2f2;
  border-radius: 0.5rem;
  margin: 1rem;
`;

const ChatManagement = () => {
  const [activeTab, setActiveTab] = useState('regions');
  const [regions, setRegions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [realTimeStats, setRealTimeStats] = useState(null);

  const pageSize = 20;

  // 실시간 통계 구독
  useEffect(() => {
    const eventSource = adminAPI.subscribeToRealTimeStats((data) => {
      if (data.type === 'chat_stats') {
        setRealTimeStats(data.stats);
      }
    });

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // 채팅 데이터 로드
  const loadChatData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [regionStats, messagesData] = await Promise.all([
        adminAPI.fetchRegionalChatStats(),
        adminAPI.fetchChatMessages(
          page, 
          pageSize, 
          regionFilter === 'all' ? null : regionFilter,
          statusFilter === 'all' ? null : statusFilter
        )
      ]);
      
      setRegions(regionStats || []);
      setMessages(messagesData.content || []);
      setTotalPages(messagesData.totalPages || 0);
    } catch (error) {
      console.error('채팅 데이터 로드 실패:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [page, regionFilter, statusFilter]);

  // 새로고침
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadChatData();
    } finally {
      setRefreshing(false);
    }
  };

  // 데이터 내보내기
  const handleExport = async () => {
    try {
      await adminAPI.exportData('chat_messages', 'excel', {
        region: regionFilter === 'all' ? null : regionFilter,
        status: statusFilter === 'all' ? null : statusFilter
      });
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
      alert('데이터 내보내기에 실패했습니다.');
    }
  };

  // 초기 로드
  useEffect(() => {
    loadChatData();
  }, [loadChatData]);

  // 메시지 삭제
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('이 메시지를 삭제하시겠습니까?')) return;

    try {
      await adminAPI.deleteChatMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      alert('메시지가 삭제되었습니다.');
    } catch (error) {
      console.error('메시지 삭제 실패:', error);
      alert('메시지 삭제에 실패했습니다: ' + error.message);
    }
  };

  // 사용자 차단
  const handleBlockUser = async (userId, reason = '부적절한 행동') => {
    if (!window.confirm('이 사용자를 차단하시겠습니까?')) return;

    try {
      await adminAPI.blockChatUser(userId, reason);
      setMessages(prev => prev.map(msg => 
        msg.userId === userId 
          ? { ...msg, status: 'blocked' }
          : msg
      ));
      alert('사용자가 차단되었습니다.');
    } catch (error) {
      console.error('사용자 차단 실패:', error);
      alert('사용자 차단에 실패했습니다: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '정상';
      case 'reported': return '신고됨';
      case 'blocked': return '차단됨';
      default: return status;
    }
  };

  // 검색된 메시지 필터링
  const filteredMessages = messages.filter(message => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (message.content || '').toLowerCase().includes(searchLower) ||
      (message.userName || '').toLowerCase().includes(searchLower) ||
      (message.region || '').toLowerCase().includes(searchLower)
    );
  });

  // 통계 계산 (실시간 데이터가 있으면 우선 사용)
  const stats = realTimeStats || {
    totalMessages: regions.reduce((sum, region) => sum + (region.messageCount || 0), 0),
    totalActiveUsers: regions.reduce((sum, region) => sum + (region.activeUsers || 0), 0),
    totalRegions: regions.length,
    reportedMessages: messages.filter(m => m.status === 'reported').length
  };

  if (error) {
    return (
      <Container>
        <ErrorState>
          <AlertTriangle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>오류 발생</h3>
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
          <Title>채팅방 관리</Title>
          <Subtitle>지역별 채팅방을 모니터링하고 관리합니다</Subtitle>
        </HeaderLeft>
        <HeaderActions>
          <ActionButton onClick={handleExport} disabled={loading}>
            <Download size={16} />
            데이터 내보내기
          </ActionButton>
          <ActionButton $variant="primary" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            새로고침
          </ActionButton>
        </HeaderActions>
      </Header>

      {/* 실시간 통계 카드 */}
      <StatsGrid>
        <StatCard>
          <StatIcon $color="blue">
            <MessageCircle size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.totalMessages?.toLocaleString() || 0}</StatValue>
            <StatLabel>총 메시지 수</StatLabel>
          </StatInfo>
        </StatCard>
        
        <StatCard>
          <StatIcon $color="green">
            <Users size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.totalActiveUsers?.toLocaleString() || 0}</StatValue>
            <StatLabel>활성 사용자</StatLabel>
          </StatInfo>
        </StatCard>
        
        <StatCard>
          <StatIcon $color="purple">
            <MapPin size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.totalRegions || 0}</StatValue>
            <StatLabel>활성 지역</StatLabel>
          </StatInfo>
        </StatCard>
        
        <StatCard>
          <StatIcon $color="red">
            <AlertTriangle size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.reportedMessages || 0}</StatValue>
            <StatLabel>신고된 메시지</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* 탭 컨테이너 */}
      <TabContainer>
        <TabHeader>
          <Tab 
            $active={activeTab === 'regions'}
            onClick={() => setActiveTab('regions')}
          >
            지역별 현황
          </Tab>
          <Tab 
            $active={activeTab === 'messages'}
            onClick={() => setActiveTab('messages')}
          >
            메시지 관리
          </Tab>
          <Tab 
            $active={activeTab === 'reports'}
            onClick={() => setActiveTab('reports')}
          >
            신고 관리
          </Tab>
        </TabHeader>

        <TabContent>
          {activeTab === 'regions' && (
            <>
              <FilterSection>
                <SearchContainer>
                  <SearchIcon>
                    <Search size={16} />
                  </SearchIcon>
                  <SearchInput
                    type="text"
                    placeholder="지역명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>
              </FilterSection>

              {loading ? (
                <LoadingState>
                  <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  데이터를 불러오는 중...
                </LoadingState>
              ) : (
                <RegionGrid>
                  {regions
                    .filter(region => 
                      !searchTerm || 
                      (region.region || '').toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((region) => (
                    <RegionCard key={region.region || region.id}>
                      <RegionHeader>
                        <RegionName>
                          <MapPin size={16} />
                          {region.region || '지역 정보 없음'}
                        </RegionName>
                        <RegionActions>
                          <RegionActionButton title="상세 보기">
                            <Eye size={14} />
                          </RegionActionButton>
                          <RegionActionButton title="설정">
                            <MoreHorizontal size={14} />
                          </RegionActionButton>
                        </RegionActions>
                      </RegionHeader>
                      <RegionStats>
                        <RegionStat>
                          <RegionStatValue>{region.activeUsers || 0}</RegionStatValue>
                          <RegionStatLabel>활성 사용자</RegionStatLabel>
                        </RegionStat>
                        <RegionStat>
                          <RegionStatValue>{region.messageCount || 0}</RegionStatValue>
                          <RegionStatLabel>총 메시지</RegionStatLabel>
                        </RegionStat>
                      </RegionStats>
                    </RegionCard>
                  ))}
                </RegionGrid>
              )}
            </>
          )}

          {activeTab === 'messages' && (
            <>
              <FilterSection>
                <SearchContainer>
                  <SearchIcon>
                    <Search size={16} />
                  </SearchIcon>
                  <SearchInput
                    type="text"
                    placeholder="메시지 내용 또는 사용자명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>
                
                <Select
                  value={regionFilter}
                  onChange={(e) => {
                    setRegionFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="all">전체 지역</option>
                  {regions.map(region => (
                    <option key={region.region} value={region.region}>
                      {region.region}
                    </option>
                  ))}
                </Select>
                
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="all">전체 상태</option>
                  <option value="active">정상</option>
                  <option value="reported">신고됨</option>
                  <option value="blocked">차단됨</option>
                </Select>
              </FilterSection>

              <MessageTable>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>사용자</TableHeaderCell>
                    <TableHeaderCell>지역</TableHeaderCell>
                    <TableHeaderCell>메시지</TableHeaderCell>
                    <TableHeaderCell>시간</TableHeaderCell>
                    <TableHeaderCell>상태</TableHeaderCell>
                    <TableHeaderCell>작업</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <tr>
                      <TableCell colSpan={6}>
                        <LoadingState>
                          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                          데이터를 불러오는 중...
                        </LoadingState>
                      </TableCell>
                    </tr>
                  ) : filteredMessages.length === 0 ? (
                    <tr>
                      <TableCell colSpan={6}>
                        <EmptyState>표시할 메시지가 없습니다.</EmptyState>
                      </TableCell>
                    </tr>
                  ) : (
                    filteredMessages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          <UserInfo>
                            <UserAvatar>{getInitials(message.userName)}</UserAvatar>
                            {message.userName || '익명'}
                          </UserInfo>
                        </TableCell>
                        <TableCell>{message.region || '지역 미상'}</TableCell>
                        <TableCell>
                          <MessageContent>{message.content || '내용 없음'}</MessageContent>
                        </TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} />
                            {formatDate(message.timestamp || message.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge $status={message.status}>
                            {getStatusText(message.status)}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          <RegionActions>
                            <RegionActionButton title="상세 보기">
                              <Eye size={14} />
                            </RegionActionButton>
                            {message.status !== 'blocked' && (
                              <RegionActionButton 
                                $danger 
                                title="사용자 차단"
                                onClick={() => handleBlockUser(message.userId)}
                              >
                                <Ban size={14} />
                              </RegionActionButton>
                            )}
                            <RegionActionButton 
                              $danger 
                              title="메시지 삭제"
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              <Trash2 size={14} />
                            </RegionActionButton>
                          </RegionActions>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </MessageTable>
            </>
          )}

          {activeTab === 'reports' && (
            <>
              <FilterSection>
                <SearchContainer>
                  <SearchIcon>
                    <Search size={16} />
                  </SearchIcon>
                  <SearchInput
                    type="text"
                    placeholder="신고된 메시지 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>
              </FilterSection>

              <MessageTable>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>신고자</TableHeaderCell>
                    <TableHeaderCell>신고 대상</TableHeaderCell>
                    <TableHeaderCell>메시지</TableHeaderCell>
                    <TableHeaderCell>신고 사유</TableHeaderCell>
                    <TableHeaderCell>신고 시간</TableHeaderCell>
                    <TableHeaderCell>작업</TableHeaderCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <tr>
                      <TableCell colSpan={6}>
                        <LoadingState>
                          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                          데이터를 불러오는 중...
                        </LoadingState>
                      </TableCell>
                    </tr>
                  ) : (
                    <tr>
                      <TableCell colSpan={6}>
                        <EmptyState>
                          <Shield size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                          신고된 메시지가 없습니다.
                        </EmptyState>
                      </TableCell>
                    </tr>
                  )}
                </TableBody>
              </MessageTable>
            </>
          )}
        </TabContent>
      </TabContainer>
    </Container>
  );
};

export default ChatManagement;