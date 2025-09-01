import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MessageSquare, Plus, Clock, CheckCircle, X, Send } from 'lucide-react';
import { fetchMyInquiries, createInquiry, getInquiry } from '../../api/mypage';
import ReactDOM from "react-dom";

const Container = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1F2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: linear-gradient(to right, #6366f1, #a855f7);
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    transform: translateY(-1px);
  }
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemTitle = styled.div`
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const ItemMeta = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const Status = styled.span`
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 500;
  
  ${({ status }) => {
    switch (status) {
      case 'ANSWERED':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case 'PENDING':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      default:
        return `
          background: #e5e7eb;
          color: #374151;
        `;
    }
  }}
`;

const Modal = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999; /* 헤더보다 높게 */
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1000000;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  
  &:hover {
    color: #374151;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  resize: vertical;
  min-height: 120px;
  
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: #b91c1c;
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
`;

const InquirySection = ({ userId }) => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const response = await fetchMyInquiries(0, 20);
      setInquiries(response.content || []);
    } catch (err) {
      console.error('문의 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const Modal = ({ children, onClose }) => {
    return ReactDOM.createPortal(
      <div
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "rgba(0,0,0,0.4)",
          zIndex: 99999
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {children}
      </div>,
      document.body
    );
  };

  const handleCreateInquiry = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await createInquiry(formData);
      setShowCreateModal(false);
      setFormData({ title: '', content: '' });
      loadInquiries();
    } catch (err) {
      console.error('문의 작성 실패:', err);
      setError('문의 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInquiryClick = async (inquiry) => {
    if (!inquiry || !inquiry.id) {
      console.error('유효하지 않은 문의 ID:', inquiry);
      return;
    }

    try {
      const detailData = await getInquiry(inquiry.id);
      setSelectedInquiry(detailData);
      setShowDetailModal(true);
    } catch (err) {
      console.error('문의 상세 조회 실패:', err);
    }

    console.log('조회할 문의 ID:', inquiry.id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return '대기중';
      case 'ANSWERED': return '답변완료';
      case 'CLOSED': return '종료';
      default: return status;
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <MessageSquare size={24} />
          1:1 문의
        </Title>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          문의 작성
        </Button>
      </Header>

      {loading ? (
        <LoadingState>문의 목록을 불러오는 중...</LoadingState>
      ) : inquiries.length === 0 ? (
        <EmptyState>
          <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>등록된 문의가 없습니다.</p>
          <p style={{ fontSize: '0.875rem' }}>첫 번째 문의를 작성해보세요!</p>
        </EmptyState>
      ) : (
        <List>
          {inquiries.map(inquiry => (
            <ListItem key={inquiry.id} onClick={() => handleInquiryClick(inquiry)}>
              <ItemInfo>
                <ItemTitle>{inquiry.title}</ItemTitle>
                <ItemMeta>{formatDate(inquiry.createdAt)}</ItemMeta>
              </ItemInfo>
              <Status status={inquiry.status}>{getStatusText(inquiry.status)}</Status>
            </ListItem>
          ))}
        </List>
      )}

      {/* 문의 작성 모달 */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>새 문의 작성</ModalTitle>
              <CloseButton onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Form onSubmit={handleCreateInquiry}>
              <Input
                type="text"
                placeholder="문의 제목을 입력하세요"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                disabled={submitting}
              />
              <Textarea
                placeholder="문의 내용을 상세히 입력해주세요"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                disabled={submitting}
              />
              <Button type="submit" disabled={submitting}>
                <Send size={16} />
                {submitting ? '작성 중...' : '문의 작성'}
              </Button>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {/* 문의 상세 모달 */}
      {showDetailModal && selectedInquiry && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowDetailModal(false)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>문의 상세</ModalTitle>
              <CloseButton onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, color: '#1f2937' }}>{selectedInquiry.title}</h4>
                <Status status={selectedInquiry.status}>{getStatusText(selectedInquiry.status)}</Status>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                작성일: {formatDate(selectedInquiry.createdAt)}
              </div>
              <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                {selectedInquiry.content}
              </div>

              {selectedInquiry.answer && (
                <div>
                  <h5 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>관리자 답변</h5>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                    답변일: {formatDate(selectedInquiry.answeredAt)}
                  </div>
                  <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: '0.5rem', border: '1px solid #86efac' }}>
                    {selectedInquiry.answer}
                  </div>
                </div>
              )}
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default InquirySection;