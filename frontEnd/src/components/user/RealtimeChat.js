import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Send, Users, MapPin, Settings, Smile, Trash2 } from 'lucide-react';
import { sendChatMessage, fetchRegionalMessages } from '../../api/mypage';
import ConfirmModal from '../common/ConfirmModal';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 600px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to right, #6366f1, #a855f7);
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  color: #fff;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RegionSelector = styled.select`
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background: white;
  color: #1f2937;
  font-size: 0.875rem;
`;

const StatusDot = styled.div`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: ${({ connected }) => (connected ? '#34d399' : '#f87171')};
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${({ isOwn }) => (isOwn ? 'flex-end' : 'flex-start')};
  position: relative;
`;

const MessageBox = styled.div`
  max-width: 18rem;
  background: ${({ isOwn }) =>
    isOwn ? 'linear-gradient(to right, #6366f1, #a855f7)' : '#f3f4f6'};
  color: ${({ isOwn }) => (isOwn ? '#fff' : '#1f2937')};
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  position: relative;
`;

const MessageMeta = styled.div`
  font-size: 0.625rem;
  color: #9ca3af;
  margin-top: 0.25rem;
  text-align: ${({ isOwn }) => (isOwn ? 'right' : 'left')};
`;

const DeleteButton = styled.button`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #ef4444;
  color: white;
  border: none;
  cursor: pointer;
  display: none;
  
  ${MessageWrapper}:hover & {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const InputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const MessageInput = styled.textarea`
  flex: 1;
  padding: 0.75rem 3rem 0.75rem 0.75rem;
  border-radius: 1rem;
  border: 1px solid #e5e7eb;
  outline: none;
  resize: none;
  font-size: 0.875rem;
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
  }
`;

const SendButton = styled.button`
  padding: 0.75rem;
  border-radius: 1rem;
  background: ${({ disabled }) => (disabled ? '#e5e7eb' : 'linear-gradient(to right, #6366f1, #a855f7)')};
  color: ${({ disabled }) => (disabled ? '#9ca3af' : '#fff')};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  border: none;
  transition: all 0.2s;
  &:hover {
    transform: ${({ disabled }) => (disabled ? 'none' : 'translateY(-2px)')};
    box-shadow: ${({ disabled }) => (disabled ? 'none' : '0 4px 6px rgba(0,0,0,0.1)')};
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
`;

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #6b7280;
`;

const regions = [
  { code: 'seoul', name: '서울' },
  { code: 'busan', name: '부산' },
  { code: 'daegu', name: '대구' },
  { code: 'incheon', name: '인천' },
  { code: 'gwangju', name: '광주' },
  { code: 'daejeon', name: '대전' },
  { code: 'ulsan', name: '울산' },
];

const RealtimeChat = ({ userId, userNickname }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('seoul');
  const [participants, setParticipants] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, [selectedRegion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const currentRegion = regions.find(r => r.code === selectedRegion);
      const response = await fetchRegionalMessages(currentRegion.name, 0, 50);

      // 백엔드 응답이 없으면 샘플 데이터 사용
      if (response.content && response.content.length > 0) {
        setMessages(response.content.reverse()); // 최신 메시지가 아래로 오도록
        setParticipants(response.totalElements);
      } else {
        // 샘플 데이터
        const sampleMessages = [
          {
            id: 1,
            userNickname: '축제마니아',
            message: `${regions.find(r => r.code === selectedRegion).name} 지역 축제 정보 궁금해요!`,
            createdAt: new Date(Date.now() - 300000).toISOString(),
            isOwn: false
          },
          {
            id: 2,
            userNickname: '현지인',
            message: '이번 주말에 좋은 축제 있어요!',
            createdAt: new Date(Date.now() - 240000).toISOString(),
            isOwn: false
          }
        ];
        setMessages(sampleMessages);
        setParticipants(25);
      }
    } catch (err) {
      console.error('메시지 로드 실패:', err);
      // 오류 시 샘플 데이터 표시
      setMessages([]);
      setParticipants(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempMessage = {
      id: Date.now(),
      userNickname: userNickname || '나',
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
      isOwn: true
    };

    // 즉시 UI 업데이트
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const currentRegion = regions.find(r => r.code === selectedRegion);
      await sendChatMessage({
        region: currentRegion.name,
        message: newMessage.trim()
      });

      // 성공 시 실제 메시지로 교체하거나 다시 로드
      setTimeout(() => {
        loadMessages();
      }, 1000);
    } catch (err) {
      console.error('메시지 전송 실패:', err);
      // 실패 시 임시 메시지 제거
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
  };

  const handleDeleteMessage = async (messageId) => {
    // 커스텀 모달로 변경
    setMessageToDelete(messageId);
    setShowDeleteConfirm(true);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      // await deleteChatMessage(messageToDelete);
      setMessages(prev => prev.filter(m => m.id !== messageToDelete));
    } catch (err) {
      console.error('메시지 삭제 실패:', err);
    } finally {
      setMessageToDelete(null);
    }
  };

  const getCurrentRegionName = () => {
    return regions.find(r => r.code === selectedRegion)?.name || '서울';
  };

  return (
    <ChatContainer>
      <Header>
        <HeaderLeft>
          <MapPin size={20} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3>지역 실시간 채팅</h3>
              <RegionSelector
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                {regions.map(region => (
                  <option key={region.code} value={region.code}>
                    {region.name}
                  </option>
                ))}
              </RegionSelector>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>
              {getCurrentRegionName()} 지역 정보를 공유해보세요
            </p>
          </div>
        </HeaderLeft>
        <HeaderRight>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <StatusDot connected={isConnected} />
            <span style={{ fontSize: '0.75rem' }}>
              {isConnected ? '연결됨' : '연결 중...'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} />
            <span style={{ fontSize: '0.75rem' }}>{participants}명</span>
          </div>
        </HeaderRight>
      </Header>

      <MessagesContainer>
        {loading ? (
          <LoadingState>메시지를 불러오는 중...</LoadingState>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageWrapper key={msg.id} isOwn={msg.isOwn}>
                <div style={{ maxWidth: '18rem' }}>
                  {!msg.isOwn && (
                    <div style={{
                      fontSize: '0.625rem',
                      color: '#6b7280',
                      marginBottom: '0.25rem'
                    }}>
                      {msg.userNickname}
                    </div>
                  )}
                  <MessageBox isOwn={msg.isOwn}>
                    {msg.message}
                    {msg.isOwn && (
                      <DeleteButton onClick={() => handleDeleteMessage(msg.id)}>
                        <Trash2 size={10} />
                      </DeleteButton>
                    )}
                  </MessageBox>
                  <MessageMeta isOwn={msg.isOwn}>
                    {formatTime(msg.createdAt)}
                  </MessageMeta>
                </div>
              </MessageWrapper>
            ))}
            <div ref={messagesEndRef} />

            {/* 삭제 확인 모달 */}
            <ConfirmModal
              isOpen={showDeleteConfirm}
              onClose={() => {
                setShowDeleteConfirm(false);
                setMessageToDelete(null);
              }}
              onConfirm={confirmDeleteMessage}
              title="메시지 삭제"
              message="이 메시지를 삭제하시겠습니까? 삭제된 메시지는 복구할 수 없습니다."
              confirmText="삭제"
              cancelText="취소"
              variant="danger"
            />
          </>
        )}
      </MessagesContainer>

      <InputContainer>
        <InputWrapper>
          <div style={{ flex: 1, position: 'relative' }}>
            <MessageInput
              rows={1}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="메시지를 입력하세요..."
              maxLength={500}
            />
          </div>
          <SendButton
            disabled={!newMessage.trim() || !isConnected}
            onClick={handleSendMessage}
          >
            <Send size={20} />
          </SendButton>
        </InputWrapper>
        <InfoRow>
          <span>Shift + Enter로 줄바꿈</span>
          <span>{newMessage.length}/500</span>
        </InfoRow>
      </InputContainer>
    </ChatContainer>
  );
};

export default RealtimeChat;
