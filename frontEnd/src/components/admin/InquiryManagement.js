// src/components/InquiryManagement.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Filter, MessageSquare, Clock, CheckCircle, Eye, Reply } from 'lucide-react';
import { fetchInquiries, fetchInquiryDetail, answerInquiry } from '../../api/admin';

const Container = styled.div`
  padding: 1.5rem;
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
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
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
      case 'yellow': return '#fef3c7';
      case 'green': return '#d1fae5';
      default: return '#f3f4f6';
    }
  }};
  color: ${({ $color }) => {
    switch ($color) {
      case 'blue': return '#1d4ed8';
      case 'yellow': return '#d97706';
      case 'green': return '#059669';
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

const FilterSection = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
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

const TableContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
  cursor: pointer;
  
  &:hover {
    background: #f9fafb;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  vertical-align: middle;
`;

const InquiryInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InquiryTitle = styled.div`
  font-weight: 500;
  color: #111827;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const InquiryMeta = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  
  ${({ $status }) => {
    if ($status === 'PENDING') {
      return `
        background: #fef3c7;
        color: #92400e;
      `;
    } else if ($status === 'ANSWERED') {
      return `
        background: #d1fae5;
        color: #065f46;
      `;
    } else {
      return `
        background: #f3f4f6;
        color: #6b7280;
      `;
    }
  }}
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: #2563eb;
          color: white;
          border: none;
          &:hover { background: #1d4ed8; }
        `;
      case 'secondary':
        return `
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          &:hover { background: #f9fafb; }
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
          border: none;
          &:hover { background: #e5e7eb; }
        `;
    }
  }}
`;

// 모달 스타일
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 0.75rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #111827;
  margin: 0;
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 0.375rem;
  color: #6b7280;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const InquiryDetail = styled.div`
  margin-bottom: 2rem;
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 1rem;
  
  @media(max-width: 640px) {
    flex-direction: column;
  }
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: #374151;
  width: 120px;
  flex-shrink: 0;
`;

const DetailValue = styled.div`
  color: #6b7280;
  flex: 1;
`;

const InquiryContent = styled.div`
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
`;

const AnswerSection = styled.div`
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
`;

const AnswerForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const InquiryManagement = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [answering, setAnswering] = useState(false);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const pageSize = 10;

  useEffect(() => {
    loadInquiries();
  }, [page, statusFilter]);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const statusValue = statusFilter === 'all' ? null : statusFilter;
      const response = await fetchInquiries(page, pageSize, statusValue);
      setInquiries(response.content || []);
    } catch (error) {
      console.error('문의 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInquiryClick = async (inquiry) => {
    try {
      const detail = await fetchInquiryDetail(inquiry.id);
      setSelectedInquiry(detail);
      setShowModal(true);
      setAnswerText('');
    } catch (error) {
      console.error('문의 상세 정보 로드 실패:', error);
      setSelectedInquiry(inquiry);
      setShowModal(true);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !selectedInquiry) return;

    try {
      setAnswering(true);
      await answerInquiry(selectedInquiry.id, answerText);
      
      // 성공 후 모달 닫기 및 목록 새로고침
      setShowModal(false);
      setSelectedInquiry(null);
      setAnswerText('');
      loadInquiries();
      
      alert('답변이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('답변 등록 실패:', error);
      alert('답변 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setAnswering(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const filteredInquiries = inquiries.filter(inquiry =>
    inquiry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.userNickname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'PENDING').length,
    answered: inquiries.filter(i => i.status === 'ANSWERED').length
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>1:1 문의 관리</Title>
          <Subtitle>사용자 문의에 신속하게 답변하고 관리합니다</Subtitle>
        </HeaderLeft>
      </Header>

      <StatsRow>
        <StatCard>
          <StatIcon $color="blue">
            <MessageSquare size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>전체 문의</StatLabel>
          </StatInfo>
        </StatCard>
        
        <StatCard>
          <StatIcon $color="yellow">
            <Clock size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>답변 대기</StatLabel>
          </StatInfo>
        </StatCard>
        
        <StatCard>
          <StatIcon $color="green">
            <CheckCircle size={24} />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.answered}</StatValue>
            <StatLabel>답변 완료</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsRow>

      <FilterSection>
        <FilterRow>
          <SearchContainer>
            <SearchIcon>
              <Search size={16} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="문의 제목 또는 사용자명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">전체 상태</option>
            <option value="PENDING">답변 대기</option>
            <option value="ANSWERED">답변 완료</option>
          </Select>
        </FilterRow>
      </FilterSection>

      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell>문의 내용</TableHeaderCell>
              <TableHeaderCell>문의자</TableHeaderCell>
              <TableHeaderCell>상태</TableHeaderCell>
              <TableHeaderCell>등록일</TableHeaderCell>
              <TableHeaderCell>작업</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            {loading ? (
              <tr>
                <TableCell colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                  데이터를 불러오는 중...
                </TableCell>
              </tr>
            ) : filteredInquiries.length === 0 ? (
              <tr>
                <TableCell colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                  표시할 문의가 없습니다.
                </TableCell>
              </tr>
            ) : (
              filteredInquiries.map((inquiry) => (
                <TableRow key={inquiry.id} onClick={() => handleInquiryClick(inquiry)}>
                  <TableCell>
                    <InquiryInfo>
                      <InquiryTitle>{inquiry.title}</InquiryTitle>
                      <InquiryMeta>
                        카테고리: {inquiry.category || '일반'}
                      </InquiryMeta>
                    </InquiryInfo>
                  </TableCell>
                  <TableCell>{inquiry.userNickname}</TableCell>
                  <TableCell>
                    <StatusBadge $status={inquiry.status}>
                      {inquiry.status === 'PENDING' && <Clock size={12} />}
                      {inquiry.status === 'ANSWERED' && <CheckCircle size={12} />}
                      {inquiry.status === 'PENDING' ? '답변 대기' : '답변 완료'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
                  <TableCell>
                    <ActionButton
                      $variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInquiryClick(inquiry);
                      }}
                    >
                      <Eye size={14} />
                      {inquiry.status === 'PENDING' ? '답변하기' : '보기'}
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 문의 상세/답변 모달 */}
      {showModal && selectedInquiry && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {selectedInquiry.status === 'PENDING' ? '문의 답변하기' : '문의 상세보기'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                ✕
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <InquiryDetail>
                <DetailRow>
                  <DetailLabel>문의자:</DetailLabel>
                  <DetailValue>{selectedInquiry.userNickname}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>제목:</DetailLabel>
                  <DetailValue>{selectedInquiry.title}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>카테고리:</DetailLabel>
                  <DetailValue>{selectedInquiry.category || '일반'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>등록일:</DetailLabel>
                  <DetailValue>{formatDate(selectedInquiry.createdAt)}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>상태:</DetailLabel>
                  <DetailValue>
                    <StatusBadge $status={selectedInquiry.status}>
                      {selectedInquiry.status === 'PENDING' ? '답변 대기' : '답변 완료'}
                    </StatusBadge>
                  </DetailValue>
                </DetailRow>
                
                <DetailLabel style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>문의 내용:</DetailLabel>
                <InquiryContent>
                  {selectedInquiry.content || selectedInquiry.message || '문의 내용이 없습니다.'}
                </InquiryContent>

                {selectedInquiry.answer && (
                  <>
                    <DetailLabel style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>답변 내용:</DetailLabel>
                    <InquiryContent style={{ background: '#f0f9ff', borderLeft: '4px solid #2563eb' }}>
                      {selectedInquiry.answer}
                    </InquiryContent>
                    <DetailRow>
                      <DetailLabel>답변일:</DetailLabel>
                      <DetailValue>{selectedInquiry.answeredAt && formatDate(selectedInquiry.answeredAt)}</DetailValue>
                    </DetailRow>
                  </>
                )}
              </InquiryDetail>

              {selectedInquiry.status === 'PENDING' && (
                <AnswerSection>
                  <DetailLabel style={{ marginBottom: '0.5rem' }}>답변 작성:</DetailLabel>
                  <AnswerForm>
                    <TextArea
                      placeholder="사용자에게 전달할 답변을 작성해주세요..."
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                    />
                  </AnswerForm>
                </AnswerSection>
              )}
            </ModalBody>

            <ModalActions>
              <ActionButton
                $variant="secondary"
                onClick={() => setShowModal(false)}
              >
                닫기
              </ActionButton>
              {selectedInquiry.status === 'PENDING' && (
                <ActionButton
                  $variant="primary"
                  onClick={handleSubmitAnswer}
                  disabled={!answerText.trim() || answering}
                >
                  <Reply size={14} />
                  {answering ? '답변 등록 중...' : '답변 등록'}
                </ActionButton>
              )}
            </ModalActions>
          </Modal>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default InquiryManagement;