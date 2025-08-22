// src/components/ChatManagement.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  MessageCircle, Users, MapPin, Activity, AlertTriangle, 
  Search, Filter, Eye, Trash2, Ban, CheckCircle, MoreHorizontal 
} from 'lucide-react';
import { fetchRegionalChatStats } from '../../api/admin';

const Container = styled.div`
  padding: 1.5rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: ${({ $color }) => {
    switch ($color) {
      case 'blue': return '#dbeafe';
      case 'green': return '#d1fae5';
      case 'purple': return '#e9d5ff';
      case 'red': return '#fecaca';
      default: return '#f3f4f6';
    }
  }};
  color: ${({ $color }) => {
    switch ($color) {
      case 'blue': return '#1d4ed8';
      case 'green': return '#059669';
      case 'purple': return '#7c3aed';
      case 'red': return '#dc2626';
      default: return '#6b7280';
    }
  }};
`;

const StatInfo = styled.div``;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #111827;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const TabContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const TabHeader = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
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
  width: 95%;
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
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    transform: translateY(-1px);
  }
`;

const RegionHeader = styled.div`
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RegionName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RegionActions = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const ActionButton = styled.button`
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
  color: #111827;
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
  background: #f9fafb;
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
    background: #f9fafb;
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

const ChatManagement = () => {
  const [activeTab, setActiveTab] = useState('regions');
  const [regions, setRegions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadChatData();
  }, []);

  const loadChatData = async () => {
    try {
      setLoading(true);
      
      // 지역별 채팅 통계 로드
      const regionStats = await fetchRegionalChatStats();
      
      // 더미 메시지 데이터 (실제로는 API에서 받아와야 함)
      const dummyMessages = [
        {
          id: 1,
          user: '김철수',
          region: '서울',
          content: '안녕하세요! 서울에서 좋은 축제 있나요?',
          timestamp: '2024-01-15T10:30:00Z',
          status: 'active'
        },
        {
          id: 2,
          user: '박영희',
          region: '부산',
          content: '부산 바다축제 정말 좋네요!',
          timestamp: '2024-01-15T09:15:00Z',
          status: 'active'
        },
        {
          id: 3,
          user: '이민수',
          region: '대구',
          content: '스팸 메시지입니다.',
          timestamp: '2024-01-15T08:45:00Z',
          status: 'reported'
        }
      ];
      
      setRegions(regionStats);
      setMessages(dummyMessages);
    } catch (error) {
      console.error('채팅 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalActiveUsers = regions.reduce((sum, region) => sum + region.activeUsers, 0);
  const totalMessages = regions.reduce((sum, region) => sum + region.messageCount, 0);
  const reportedMessages = messages.filter(m => m.status === 'reported').length;

  return (
    <Container>
      <Header>
        <Title>채팅방 관리</Title>
        <Subtitle>지역별 채팅방을 모니터링하고 관리합니다</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon $color="blue">
            <MessageCircle size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{totalMessages.toLocaleString()}</StatValue>
            <StatLabel>총 메시지 수</StatLabel>
          </StatInfo>
        </StatCard>
        
        <StatCard>
          <StatIcon $color="green">
            <Users size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{totalActiveUsers.toLocaleString()}</StatValue>
            <StatLabel>활성 사용자</StatLabel>
          </StatInfo>
        </StatCard>
        
        <StatCard>
          <StatIcon $color="purple">
            <MapPin size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{regions.length}</StatValue>
            <StatLabel>활성 지역</StatLabel>
          </StatInfo>
        </StatCard>
        
        <StatCard>
          <StatIcon $color="red">
            <AlertTriangle size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{reportedMessages}</StatValue>
            <StatLabel>신고된 메시지</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsGrid>

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
                <EmptyState>데이터를 불러오는 중...</EmptyState>
              ) : (
                <RegionGrid>
                  {regions.map((region) => (
                    <RegionCard key={region.region}>
                      <RegionHeader>
                        <RegionName>
                          <MapPin size={16} />
                          {region.region}
                        </RegionName>
                        <RegionActions>
                          <ActionButton title="상세 보기">
                            <Eye size={14} />
                          </ActionButton>
                          <ActionButton title="설정">
                            <MoreHorizontal size={14} />
                          </ActionButton>
                        </RegionActions>
                      </RegionHeader>
                      <RegionStats>
                        <RegionStat>
                          <RegionStatValue>{region.activeUsers}</RegionStatValue>
                          <RegionStatLabel>활성 사용자</RegionStatLabel>
                        </RegionStat>
                        <RegionStat>
                          <RegionStatValue>{region.messageCount}</RegionStatValue>
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                  {filteredMessages.length === 0 ? (
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
                            <UserAvatar>{getInitials(message.user)}</UserAvatar>
                            {message.user}
                          </UserInfo>
                        </TableCell>
                        <TableCell>{message.region}</TableCell>
                        <TableCell>
                          <MessageContent>{message.content}</MessageContent>
                        </TableCell>
                        <TableCell>{formatDate(message.timestamp)}</TableCell>
                        <TableCell>
                          <StatusBadge $status={message.status}>
                            {message.status === 'active' && '정상'}
                            {message.status === 'reported' && '신고됨'}
                            {message.status === 'blocked' && '차단됨'}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          <RegionActions>
                            <ActionButton title="상세 보기">
                              <Eye size={14} />
                            </ActionButton>
                            {message.status !== 'blocked' && (
                              <ActionButton $danger title="차단">
                                <Ban size={14} />
                              </ActionButton>
                            )}
                            <ActionButton $danger title="삭제">
                              <Trash2 size={14} />
                            </ActionButton>
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
                  <tr>
                    <TableCell colSpan={6}>
                      <EmptyState>신고된 메시지가 없습니다.</EmptyState>
                    </TableCell>
                  </tr>
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