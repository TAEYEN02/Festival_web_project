import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Send, Users, MapPin, Settings, Smile } from 'lucide-react';

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
`;

const MessageBox = styled.div`
  max-width: 18rem;
  background: ${({ isOwn }) =>
    isOwn ? 'linear-gradient(to right, #6366f1, #a855f7)' : '#f3f4f6'};
  color: ${({ isOwn }) => (isOwn ? '#fff' : '#1f2937')};
  padding: 0.5rem 1rem;
  border-radius: 1rem;
`;

const MessageMeta = styled.div`
  font-size: 0.625rem;
  color: #9ca3af;
  margin-top: 0.25rem;
  text-align: ${({ isOwn }) => (isOwn ? 'right' : 'left')};
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

const EmojiButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  &:hover {
    background: #e5e7eb;
  }
`;

const SendButton = styled.button`
  padding: 0.75rem;
  border-radius: 1rem;
  background: ${({ disabled }) => (disabled ? '#e5e7eb' : 'linear-gradient(to right, #6366f1, #a855f7)')};
  color: ${({ disabled }) => (disabled ? '#9ca3af' : '#fff')};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
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

const RealtimeChat = ({ regionCode = 'seoul', regionName = '서울' }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState(42);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const sampleMessages = [
    { id: 1, username: '축제마니아', message: '서울 불꽃축제 언제 시작하나요?', timestamp: new Date(Date.now() - 300000) },
    { id: 2, username: '한강러버', message: '한강공원에서 7시부터 시작해요!', timestamp: new Date(Date.now() - 240000) },
    { id: 3, username: '사진작가', message: '좋은 촬영 포인트 추천 부탁드려요', timestamp: new Date(Date.now() - 180000) },
    { id: 4, username: '로컬가이드', message: '63빌딩 근처가 뷰가 좋아요', timestamp: new Date(Date.now() - 120000) }
  ];

  useEffect(() => {
    setMessages(sampleMessages);
    setIsConnected(true);

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomUsers = ['여행객A', '지역주민', '축제참가자', '관광가이드'];
        const randomMessages = [
          '축제 정말 재미있네요!',
          '사람이 너무 많아요 ㅠㅠ',
          '주차장 어디에 있나요?',
          '맛집 추천 부탁드려요',
          '다음에도 또 오고 싶어요',
          '사진 찍기 좋은 곳이네요'
        ];

        const newMsg = {
          id: Date.now(),
          username: randomUsers[Math.floor(Math.random() * randomUsers.length)],
          message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newMsg]);
        setParticipants(prev => prev + Math.floor(Math.random() * 3) - 1);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [regionCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      username: '나',
      message: newMessage.trim(),
      timestamp: new Date(),
      isOwn: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  return (
    <ChatContainer>
      <Header>
        <HeaderLeft>
          <MapPin size={20} />
          <div>
            <h3>{regionName} 실시간 채팅</h3>
            <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>지역 정보를 공유해보세요</p>
          </div>
        </HeaderLeft>
        <HeaderRight>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <StatusDot connected={isConnected} />
            <span style={{ fontSize: '0.75rem' }}>{isConnected ? '연결됨' : '연결 중...'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} />
            <span style={{ fontSize: '0.75rem' }}>{participants}명</span>
          </div>
          <Settings size={16} />
        </HeaderRight>
      </Header>

      <MessagesContainer>
        {messages.map((msg) => (
          <MessageWrapper key={msg.id} isOwn={msg.isOwn}>
            <div style={{ maxWidth: '18rem' }}>
              {!msg.isOwn && <div style={{ fontSize: '0.625rem', color: '#6b7280', marginBottom: '0.25rem' }}>{msg.username}</div>}
              <MessageBox isOwn={msg.isOwn}>{msg.message}</MessageBox>
              <MessageMeta isOwn={msg.isOwn}>{formatTime(msg.timestamp)}</MessageMeta>
            </div>
          </MessageWrapper>
        ))}
        <div ref={messagesEndRef} />
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
            <EmojiButton><Smile size={20} /></EmojiButton>
          </div>
          <SendButton disabled={!newMessage.trim() || !isConnected} onClick={handleSendMessage}>
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
