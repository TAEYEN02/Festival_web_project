import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Send, Users, MapPin, AlertTriangle, Trash2, Flag, X, Shield } from 'lucide-react';
import { getCurrentUser } from '../../api/auth';

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
`;

const MapSection = styled.div`
  width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 1.5rem;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  
  @media (max-width: 1024px) {
    width: 100%;
    position: absolute;
    top: 0;
    left: ${({ $showMap }) => $showMap ? '0' : '-100%'};
    z-index: 10;
    transition: left 0.3s ease;
  }
`;

const MapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const MapTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  display: none;
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 0.5rem;
  color: #6b7280;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  @media (max-width: 1024px) {
    display: block;
  }
`;

const KoreaMapContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MapSVG = styled.svg`
  width: 100%;
  height: 300px;
  cursor: pointer;
`;

const RegionPath = styled.path`
  fill: ${({ $selected, $hasUsers }) => {
    if ($selected) return '#3b82f6';
    if ($hasUsers) return '#10b981';
    return '#e5e7eb';
  }};
  stroke: #ffffff;
  stroke-width: 1;
  transition: all 0.2s ease;
  
  &:hover {
    fill: ${({ $selected }) => $selected ? '#2563eb' : '#6366f1'};
    stroke-width: 2;
  }
`;

const RegionInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const SelectedRegion = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RegionStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
`;

const Stat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ChatSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
`;

const ChatHeader = styled.div`
  padding: 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ChatHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ChatTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
`;

const ChatSubtitle = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  margin-top: 0.25rem;
`;

const ChatHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MapToggle = styled.button`
  display: none;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  @media (max-width: 1024px) {
    display: block;
  }
`;

const OnlineUsers = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f8fafc;
`;

const MessageWrapper = styled.div`
  display: flex;
  justify-content: ${({ $isOwn }) => $isOwn ? 'flex-end' : 'flex-start'};
  position: relative;
  margin-bottom: 0.5rem;
`;

const MessageBox = styled.div`
  max-width: 70%;
  background: ${({ $isOwn }) =>
    $isOwn ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : '#ffffff'};
  color: ${({ $isOwn }) => $isOwn ? '#ffffff' : '#1f2937'};
  padding: 1rem;
  border-radius: 1rem;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: ${({ $isOwn }) => $isOwn ? 'none' : '1px solid #e5e7eb'};
  
  ${({ $isOwn }) => !$isOwn && `
    border-bottom-left-radius: 0.25rem;
  `}
  
  ${({ $isOwn }) => $isOwn && `
    border-bottom-right-radius: 0.25rem;
  `}
`;

const MessageMeta = styled.div`
  font-size: 0.75rem;
  color: ${({ $isOwn }) => $isOwn ? 'rgba(255, 255, 255, 0.7)' : '#9ca3af'};
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MessageContent = styled.div`
  word-wrap: break-word;
  line-height: 1.5;
`;

const MessageActions = styled.div`
  position: absolute;
  top: -0.5rem;
  right: ${({ $isOwn }) => $isOwn ? '-2.5rem' : 'auto'};
  left: ${({ $isOwn }) => $isOwn ? 'auto' : '-2.5rem'};
  display: none;
  flex-direction: column;
  gap: 0.25rem;
  
  ${MessageWrapper}:hover & {
    display: flex;
  }
`;

const ActionButton = styled.button`
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 50%;
  background: ${({ $danger }) => $danger ? '#ef4444' : '#6b7280'};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const InputContainer = styled.div`
  padding: 1rem;
  background: white;
  border-top: 1px solid #e5e7eb;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  resize: none;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SendButton = styled.button`
  padding: 1rem;
  background: ${({ $disabled }) => $disabled ? '#e5e7eb' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'};
  color: ${({ $disabled }) => $disabled ? '#9ca3af' : 'white'};
  border: none;
  border-radius: 1rem;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: ${({ $disabled }) => $disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${({ $disabled }) => $disabled ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'};
  }
`;

const InputInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
`;

// 신고 모달
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
  margin: 0;
`;

const ModalCloseButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 0.5rem;
  color: #6b7280;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ReportReasonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const ReportReasonButton = styled.button`
  padding: 1rem;
  border: 2px solid ${({ $selected }) => $selected ? '#3b82f6' : '#e5e7eb'};
  background: ${({ $selected }) => $selected ? '#eff6ff' : 'white'};
  color: ${({ $selected }) => $selected ? '#1d4ed8' : '#374151'};
  border-radius: 0.5rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ $variant }) => {
    if ($variant === 'danger') {
      return `
        background: #dc2626;
        color: white;
        &:hover { background: #b91c1c; }
      `;
    }
    return `
      background: #f3f4f6;
      color: #374151;
      &:hover { background: #e5e7eb; }
    `;
  }}
`;

// 한국 지도 데이터 (간소화된 SVG 경로)
const koreaRegions = [
  { id: 'seoul', name: '서울특별시', path: 'M120,80 L140,75 L145,85 L135,95 L120,90 Z', users: 1247 },
  { id: 'busan', name: '부산광역시', path: 'M180,140 L195,135 L200,145 L190,155 L180,150 Z', users: 892 },
  { id: 'daegu', name: '대구광역시', path: 'M160,120 L175,115 L180,125 L170,135 L160,130 Z', users: 634 },
  { id: 'incheon', name: '인천광역시', path: 'M100,85 L115,80 L120,90 L110,100 L100,95 Z', users: 456 },
  { id: 'gwangju', name: '광주광역시', path: 'M140,150 L155,145 L160,155 L150,165 L140,160 Z', users: 378 },
  { id: 'daejeon', name: '대전광역시', path: 'M130,110 L145,105 L150,115 L140,125 L130,120 Z', users: 523 },
  { id: 'ulsan', name: '울산광역시', path: 'M190,130 L205,125 L210,135 L200,145 L190,140 Z', users: 289 },
  { id: 'gyeonggi', name: '경기도', path: 'M90,70 L140,65 L145,85 L120,90 L100,95 L85,85 Z', users: 2156 },
  { id: 'gangwon', name: '강원도', path: 'M145,50 L200,45 L205,75 L180,80 L145,85 Z', users: 234 },
  { id: 'chungbuk', name: '충청북도', path: 'M130,85 L165,80 L170,105 L145,110 L130,105 Z', users: 187 },
  { id: 'chungnam', name: '충청남도', path: 'M105,95 L145,90 L150,115 L120,120 L105,115 Z', users: 312 },
  { id: 'jeonbuk', name: '전라북도', path: 'M120,120 L155,115 L160,140 L130,145 L120,140 Z', users: 278 },
  { id: 'jeonnam', name: '전라남도', path: 'M115,140 L160,135 L165,165 L125,170 L115,160 Z', users: 201 },
  { id: 'gyeongbuk', name: '경상북도', path: 'M150,85 L195,80 L200,125 L170,130 L150,105 Z', users: 445 },
  { id: 'gyeongnam', name: '경상남도', path: 'M160,130 L205,125 L210,155 L175,160 L160,150 Z', users: 389 },
  { id: 'jeju', name: '제주특별자치도', path: 'M90,180 L120,175 L125,190 L100,195 L90,190 Z', users: 156 }
];

const reportReasons = [
  '스팸 또는 광고',
  '욕설 및 비방',
  '개인정보 노출',
  '불법적인 내용',
  '성적인 내용',
  '기타 부적절한 내용'
];

const RealtimeChat = ({ userId = 1, userNickname = "사용자" }) => {
  const [selectedRegion, setSelectedRegion] = useState('seoul');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [websocket, setWebsocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingMessage, setReportingMessage] = useState(null);
  const [selectedReportReason, setSelectedReportReason] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  

  const { token } = getCurrentUser();

  // WebSocket 연결
  useEffect(() => {
    if (!token) {
      console.error("토큰 없음, WebSocket 연결 불가");
      return;
    }

    const ws = new WebSocket(`ws://localhost:8081/ws/chat?token=${token}`);

    ws.onopen = () => {
      console.log('WebSocket 연결됨');
      ws.send(JSON.stringify({
        type: 'JOIN_REGION',
        region: selectedRegion,
        userId,
        nickname: userNickname
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'NEW_MESSAGE':
          setMessages(prev => [...prev, {
            id: data.id,
            content: data.content,
            nickname: data.nickname,
            userId: data.userId,
            timestamp: data.timestamp,
            isOwn: data.userId === userId
          }]);
          break;
        case 'USER_COUNT':
          setOnlineUsers(data.count);
          break;
        case 'REGION_MESSAGES':
          setMessages(data.messages.map(msg => ({ ...msg, isOwn: msg.userId === userId })));
          break;
        default:
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket 연결 종료');
      // 재연결 시도
      setTimeout(() => setWebsocket(null), 3000);
    };

    ws.onerror = (error) => console.error('WebSocket 오류:', error);

    setWebsocket(ws);

    return () => {
      ws.close();
    };
  }, [token, selectedRegion, userId, userNickname]);

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 지역 변경
  const handleRegionChange = (regionId) => {
    setSelectedRegion(regionId);
    setMessages([]);

    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({ type: 'LEAVE_REGION' }));
      websocket.send(JSON.stringify({
        type: 'JOIN_REGION',
        region: regionId,
        userId,
        nickname: userNickname
      }));
    }
  };

  // 메시지 전송
  const sendMessage = () => {
    if (!newMessage.trim() || !websocket || websocket.readyState !== WebSocket.OPEN) return;

    websocket.send(JSON.stringify({
      type: 'SEND_MESSAGE',
      content: newMessage.trim(),
      region: selectedRegion,
      userId,
      nickname: userNickname,
      timestamp: new Date().toISOString()
    }));

    setNewMessage('');
  };

  // 메시지 삭제
  const deleteMessage = (messageId) => {
    if (!websocket || websocket.readyState !== WebSocket.OPEN) return;

    websocket.send(JSON.stringify({
      type: 'DELETE_MESSAGE',
      messageId,
      userId
    }));
  };

  // 메시지 신고
  const reportMessage = (message) => {
    setReportingMessage(message);
    setShowReportModal(true);
  };

  const submitReport = () => {
    if (!selectedReportReason || !reportingMessage) return;

    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({
        type: 'REPORT_MESSAGE',
        messageId: reportingMessage.id,
        reason: selectedReportReason,
        reporterId: userId,
        reporterNickname: userNickname
      }));
    }

    setShowReportModal(false);
    setReportingMessage(null);
    setSelectedReportReason('');
    alert('신고가 접수되었습니다.');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectedRegionData = koreaRegions.find(r => r.id === selectedRegion);
  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

  return (
    <Container>
      <MapSection $showMap={showMap}>
        <MapHeader>
          <MapTitle>
            <MapPin size={20} />
            지역 선택
          </MapTitle>
          <CloseButton onClick={() => setShowMap(false)}>
            <X size={20} />
          </CloseButton>
        </MapHeader>

        <KoreaMapContainer>
          <MapSVG viewBox="0 0 250 220">
            {koreaRegions.map((region) => (
              <RegionPath
                key={region.id}
                d={region.path}
                $selected={selectedRegion === region.id}
                $hasUsers={region.users > 0}
                onClick={() => handleRegionChange(region.id)}
                title={`${region.name} (${region.users}명 접속)`}
              />
            ))}
          </MapSVG>

          {selectedRegionData && (
            <RegionInfo>
              <SelectedRegion>
                <MapPin size={16} />
                {selectedRegionData.name}
              </SelectedRegion>
              <RegionStats>
                <Stat>
                  <StatValue>{onlineUsers}</StatValue>
                  <StatLabel>실시간 접속자</StatLabel>
                </Stat>
                <Stat>
                  <StatValue>{selectedRegionData.users}</StatValue>
                  <StatLabel>총 사용자</StatLabel>
                </Stat>
              </RegionStats>
            </RegionInfo>
          )}
        </KoreaMapContainer>
      </MapSection>

      <ChatSection>
        <ChatHeader>
          <ChatHeaderLeft>
            <MapToggle onClick={() => setShowMap(true)}>
              <MapPin size={20} />
            </MapToggle>
            <div>
              <ChatTitle>{selectedRegionData?.name} 채팅방</ChatTitle>
              <ChatSubtitle>지역 주민들과 실시간으로 소통해보세요</ChatSubtitle>
            </div>
          </ChatHeaderLeft>

          <ChatHeaderRight>
            <OnlineUsers>
              <Users size={16} />
              {onlineUsers}명 접속 중
            </OnlineUsers>
          </ChatHeaderRight>
        </ChatHeader>

        <MessagesContainer>
          {messages.map((message) => (
            <MessageWrapper key={message.id} $isOwn={message.isOwn}>
              <MessageBox $isOwn={message.isOwn}>
                <MessageMeta $isOwn={message.isOwn}>
                  <span>{message.isOwn ? '나' : message.nickname}</span>
                  <span>{formatTime(message.timestamp)}</span>
                </MessageMeta>
                <MessageContent>{message.content}</MessageContent>

                <MessageActions $isOwn={message.isOwn}>
                  {!message.isOwn && (
                    <ActionButton
                      onClick={() => reportMessage(message)}
                      title="신고"
                    >
                      <Flag size={12} />
                    </ActionButton>
                  )}
                  {message.isOwn && (
                    <ActionButton
                      $danger
                      onClick={() => deleteMessage(message.id)}
                      title="삭제"
                    >
                      <Trash2 size={12} />
                    </ActionButton>
                  )}
                </MessageActions>
              </MessageBox>
            </MessageWrapper>
          ))}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputContainer>
          <InputWrapper>
            <MessageInput
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요... (Shift + Enter로 줄바꿈)"
              rows={1}
              maxLength={500}
            />
            <SendButton
              $disabled={!newMessage.trim()}
              onClick={sendMessage}
            >
              <Send size={20} />
            </SendButton>
          </InputWrapper>
          <InputInfo>
            <span>Shift + Enter로 줄바꿈</span>
            <span>{newMessage.length}/500</span>
          </InputInfo>
        </InputContainer>
      </ChatSection>

      {/* 신고 모달 */}
      {showReportModal && (
        <Modal onClick={() => setShowReportModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>메시지 신고</ModalTitle>
              <ModalCloseButton onClick={() => setShowReportModal(false)}>
                <X size={20} />
              </ModalCloseButton>
            </ModalHeader>

            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
              <strong>{reportingMessage?.nickname}</strong>: {reportingMessage?.content}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem' }}>
                신고 사유를 선택해주세요:
              </label>
              <ReportReasonList>
                {reportReasons.map((reason) => (
                  <ReportReasonButton
                    key={reason}
                    $selected={selectedReportReason === reason}
                    onClick={() => setSelectedReportReason(reason)}
                  >
                    {reason}
                  </ReportReasonButton>
                ))}
              </ReportReasonList>
            </div>

            <ModalActions>
              <ModalButton onClick={() => setShowReportModal(false)}>
                취소
              </ModalButton>
              <ModalButton
                $variant="danger"
                onClick={submitReport}
                disabled={!selectedReportReason}
              >
                신고하기
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default RealtimeChat;