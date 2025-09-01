import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Send, Users, MapPin, AlertTriangle, Trash2, Flag, X } from 'lucide-react';
import { getCurrentUser } from '../../api/auth';
import { SVGMap } from 'react-svg-map';
import SouthKorea from '@svg-maps/south-korea';

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 100%, #764ba2 0%);
  overflow: hidden;
`;

const MapSection = styled.div`
  width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 1.5rem;
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

const MapWrapper = styled.div`
  width: 100%;
  height: 400px;
  margin-bottom: 1rem;
  
  .svg-map {
    width: 100%;
    height: 100%;
  }
  
  .svg-map__location {
    fill: #e5e7eb;
    stroke: #ffffff;
    stroke-width: 1.5;
    transition: all 0.3s ease;
    cursor: pointer;
  }
  
  .svg-map__location:hover {
    fill: #60a5fa;
    stroke-width: 2;
  }
  
  .svg-map__location[data-selected="true"] {
    fill: #2563eb !important;
    stroke-width: 2;
  }
  
  .svg-map__location[data-has-users="true"] {
    fill: #93c5fd;
  }
  
  .svg-map__location[data-selected="true"]:hover {
    fill: #1d4ed8;
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
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RegionStats = styled.div`
  display: flex;
  justify-content: center;
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
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  z-index: 1;

  ${MessageWrapper}:hover & {
    opacity: 1;
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

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

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
  z-index: 999999;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1000000;
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

// 지역 ID 매핑
const regionIdMapping = {
  'seoul': '서울',
  'busan': '부산',
  'daegu': '대구',
  'incheon': '인천',
  'gwangju': '광주',
  'daejeon': '대전',
  'ulsan': '울산',
  'gyeonggi': '경기',
  'gangwon': '강원',
  'north-chungcheong': '충북',
  'south-chungcheong': '충남',
  'north-jeolla': '전북',
  'south-jeolla': '전남',
  'north-gyeongsang': '경북',
  'south-gyeongsang': '경남',
  'jeju': '제주'
};


const reportReasons = [
  '스팸 또는 광고',
  '욕설 및 비방',
  '개인정보 노출',
  '불법적인 내용',
  '성적인 내용',
  '기타 부적절한 내용'
];

const RealtimeChat = () => {
  // 모든 useState 훅들
  const [selectedRegion, setSelectedRegion] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [websocket, setWebsocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingMessage, setReportingMessage] = useState(null);
  const [selectedReportReason, setSelectedReportReason] = useState('');
  // 사용자 정보 상태 추가
  const [userInfo, setUserInfo] = useState(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);

  // useRef 훅들
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [connectionError, setConnectionError] = useState('');

  // 사용자 정보를 API에서 가져오는 useEffect 추가
  useEffect(() => {
    const fetchUserInfo = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser?.token) {
        setLoadingUserInfo(false);
        return;
      }

      try {
        // MyPageController의 /api/mypage/profile 엔드포인트 사용
        const response = await fetch('/api/mypage/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const profileData = await response.json();
          console.log('API에서 가져온 사용자 정보:', profileData);
          setUserInfo({
            id: profileData.id,
            username: profileData.username,
            nickname: profileData.nickname,
            email: profileData.email
          });
        } else {
          console.error('사용자 정보 조회 실패:', response.status);
          // API 실패 시 JWT에서 정보 추출
          const jwtPayload = parseJwtPayload(currentUser.token);
          setUserInfo({
            id: jwtPayload?.userId || 1,
            username: currentUser.username,
            nickname: currentUser.username || '사용자'
          });
        }
      } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
        // 오류 시 기본값 설정
        const currentUser = getCurrentUser();
        setUserInfo({
          id: 1,
          username: currentUser.username,
          nickname: currentUser.username || '사용자'
        });
      } finally {
        setLoadingUserInfo(false);
      }
    };

    fetchUserInfo();
  }, []);

  // JWT 토큰에서 사용자 정보 추출하는 함수
  const parseJwtPayload = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT 토큰 파싱 오류:', error);
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const token = currentUser?.token;
  
  // API에서 가져온 사용자 정보 사용
  const userId = userInfo?.id;
  const username = userInfo?.username;
  const userNickname = userInfo?.nickname;

  // WebSocket 연결 useEffect
  useEffect(() => {
    // 사용자 정보가 로딩 중이면 대기
    if (loadingUserInfo) {
      return;
    }

    // 지역이 선택되지 않았다면 웹소켓 연결을 시도하지 않습니다.
    if (!selectedRegion) {
      if (websocket) {
        websocket.close();
      }
      return;
    }

    if (!token || !userInfo || !username || !userNickname) {
      console.log('사용자 정보 부족:', { token: !!token, userInfo, username, userNickname });
      setConnectionError("로그인 정보가 부족합니다.");
      return;
    }

    console.log('WebSocket 연결 시도 - 사용자 정보:', { userId, username, userNickname });

    const ws = new WebSocket(`ws://localhost:8081/ws/chat?token=${token}`);

    ws.onopen = () => {
      console.log('WebSocket 연결됨');
      setConnectionError('');
      
      const backendRegionCode = regionIdMapping[selectedRegion] || selectedRegion;
      const joinMessage = {
        type: 'JOIN_REGION',
        region: backendRegionCode,
        userId: userId,
        username: username,
        nickname: userNickname
      };
      
      console.log('JOIN_REGION 전송:', joinMessage);
      ws.send(JSON.stringify(joinMessage));
    };

    ws.onmessage = (event) => {
      console.log('받은 메시지:', event.data);
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'NEW_MESSAGE':
            setMessages(prev => [...prev, {
              id: data.id || Date.now(),
              content: data.content,
              nickname: data.nickname,
              userId: data.userId,
              timestamp: data.timestamp,
              isOwn: data.userId === userId
            }]);
            break;
          case 'USER_COUNT':
            setOnlineUsers(data.count || 0);
            break;
          case 'REGION_MESSAGES':
          case 'PREVIOUS_MESSAGES':
            const mappedMessages = (data.messages || []).map(msg => ({ 
              ...msg, 
              isOwn: msg.userId === userId 
            })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setMessages(mappedMessages);
            break;
          case 'ERROR':
            console.error('서버 오류:', data.message);
            setConnectionError(`서버 오류: ${data.message}`);
            break;
          case 'JOIN_SUCCESS':
            console.log('지역 입장 성공');
            setConnectionError('');
            const backendRegionCode = regionIdMapping[selectedRegion] || selectedRegion;
            ws.send(JSON.stringify({
              type: 'GET_PREVIOUS_MESSAGES',
              region: backendRegionCode,
              limit: 50
            }));
            break;
          case 'MESSAGE_DELETED':
            setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('메시지 파싱 오류:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket 연결 종료');
      setConnectionError('연결이 끊어졌습니다.');
    };

    ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
      setConnectionError('연결 중 오류가 발생했습니다.');
    };

    setWebsocket(ws);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'LEAVE_REGION' }));
      }
      ws.close();
    };
  }, [token, selectedRegion, userId, username, userNickname, userInfo, loadingUserInfo]);

  // 메시지 자동 스크롤 useEffect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 지역 변경 핸들러 - 더 정확한 클릭 감지
  const handleLocationClick = (event) => {
    // SVG path 요소의 id를 가져옵니다.
    const locationId = event.target.id;
    
    // 유효한 지역 ID이고, 현재 선택된 지역과 다른 경우에만 처리합니다.
    if (locationId && regionIdMapping[locationId] && locationId !== selectedRegion) {
      console.log(`지역 변경: ${selectedRegion || '없음'} -> ${locationId}`);
      
      // 선택된 지역 상태를 업데이트합니다.
      // 이 상태 변경으로 인해 WebSocket 연결 useEffect가 자동으로 재실행됩니다.
      setSelectedRegion(locationId);
      setMessages([]); // 즉각적인 UI 피드백을 위해 메시지 목록을 비웁니다.
      setConnectionError('');
    }
  };

  // SVG 엘리먼트에 데이터 속성 추가하는 함수
  const updateSvgAttributes = () => {
    setTimeout(() => {
      const svgElements = document.querySelectorAll('.svg-map__location');
      svgElements.forEach(element => {
        const locationId = element.id;
        
        // 선택된 지역 표시
        if (locationId === selectedRegion) {
          element.setAttribute('data-selected', 'true');
        } else {
          element.removeAttribute('data-selected');
        }
      });
    }, 100);
  };

  // 지역이 변경될 때마다 SVG 속성 업데이트
  useEffect(() => {
    updateSvgAttributes();
  }, [selectedRegion]);

  // 메시지 전송
  const sendMessage = () => {
    if (!newMessage.trim() || !websocket || websocket.readyState !== WebSocket.OPEN) return;

    const messageData = {
      type: 'SEND_MESSAGE',
      content: newMessage.trim(),
      region: regionIdMapping[selectedRegion] || selectedRegion,
      userId: userId,
      nickname: userNickname,
      timestamp: new Date().toISOString()
    };
    
    websocket.send(JSON.stringify(messageData));
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
    if (!selectedReportReason || !reportingMessage || !websocket || websocket.readyState !== WebSocket.OPEN) return;

    websocket.send(JSON.stringify({
      type: 'REPORT_MESSAGE',
      messageId: reportingMessage.id,
      reason: selectedReportReason,
      reporterId: userId,
      reporterNickname: userNickname
    }));

    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === reportingMessage.id
          ? { ...msg, content: '신고된 메시지입니다.', isReported: true }
          : msg
      )
    );

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

  // 사용자 정보가 없거나 로딩 중이면 적절한 화면 표시
  if (loadingUserInfo) {
    return (
      <Container>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100vh',
          color: '#3b82f6',
          fontSize: '1.2rem'
        }}>
          사용자 정보를 불러오는 중...
        </div>
      </Container>
    );
  }

  if (!userInfo || !token) {
    return (
      <Container>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100vh',
          color: '#dc2626',
          fontSize: '1.2rem'
        }}>
          로그인이 필요합니다.
        </div>
      </Container>
    );
  }

  const selectedLocation = SouthKorea.locations.find(location => location.id === selectedRegion);
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
          <MapWrapper>
            <SVGMap
              map={SouthKorea}
              onLocationClick={handleLocationClick}
            />
          </MapWrapper>

          {selectedLocation && (
            <RegionInfo>
              <SelectedRegion>
                <MapPin size={16} />
                {selectedLocation.name}
              </SelectedRegion>
              <RegionStats>
                <Stat>
                  <StatValue>{onlineUsers}</StatValue>
                  <StatLabel>실시간 접속자</StatLabel>
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
              <ChatTitle>{selectedLocation?.name || '지역 선택'} 채팅방</ChatTitle>
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
          {connectionError && (
            <ErrorMessage>
              <AlertTriangle size={16} />
              {connectionError}
            </ErrorMessage>
          )}
          
          {messages.length === 0 && !connectionError ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#6b7280', 
              marginTop: '2rem',
              fontSize: '0.875rem'
            }}>
              아직 메시지가 없습니다. 첫 번째 메시지를 보내보세요!
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageWrapper key={message.id || index} $isOwn={message.isOwn}>
                <MessageBox $isOwn={message.isOwn}>
                  <MessageMeta $isOwn={message.isOwn}>
                    <span>{message.isOwn ? '나' : message.nickname}</span>
                    <span>{formatTime(message.timestamp)}</span>
                  </MessageMeta>
                  <MessageContent>{message.content}</MessageContent>

                  <MessageActions $isOwn={message.isOwn}>
                    {!message.isOwn && !message.isReported && (
                      <ActionButton onClick={() => reportMessage(message)} title="신고">
                        <Flag size={12} />
                      </ActionButton>
                    )}
                    {message.isOwn && (
                      <ActionButton $danger onClick={() => deleteMessage(message.id)} title="삭제">
                        <Trash2 size={12} />
                      </ActionButton>
                    )}
                  </MessageActions>
                </MessageBox>
              </MessageWrapper>
            ))
          )}
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
              disabled={!!connectionError}
            />
            <SendButton $disabled={!newMessage.trim() || !!connectionError} onClick={sendMessage}>
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
                신고 사유를 선택하세요
              </label>
              <ReportReasonList>
                {reportReasons.map((reason, idx) => (
                  <ReportReasonButton
                    key={idx}
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