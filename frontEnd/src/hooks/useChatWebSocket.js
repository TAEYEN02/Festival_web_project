import { useEffect, useRef, useCallback, useState } from 'react';
import { chatWebSocketManager } from '../websocket/ChatWebSocketManager';

export const useChatWebSocket = (region, userId, userNickname) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const messageHandlerRef = useRef(null);
  const connectionHandlerRef = useRef(null);
  const isInitializedRef = useRef(false);

  // 메시지 핸들러
  const handleMessage = useCallback((data) => {
    console.log('WebSocket 메시지 수신:', data);
    
    switch (data.type) {
      case 'NEW_MESSAGE':
        setMessages(prev => {
          // 중복 메시지 방지
          if (prev.some(msg => msg.id === data.id)) {
            return prev;
          }
          return [...prev, {
            id: data.id,
            content: data.content,
            nickname: data.nickname,
            userId: data.userId,
            timestamp: data.timestamp,
            isOwn: data.userId === userId
          }];
        });
        break;
        
      case 'MESSAGE_DELETED':
        setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
        break;
        
      case 'USER_COUNT':
        setOnlineUsers(data.count || 0);
        break;
        
      case 'REGION_MESSAGES':
        if (Array.isArray(data.messages)) {
          setMessages(data.messages.map(msg => ({
            ...msg,
            isOwn: msg.userId === userId
          })));
        }
        break;
        
      case 'ERROR':
        setError(data.message || '알 수 없는 오류가 발생했습니다.');
        setTimeout(() => setError(null), 5000);
        break;
        
      case 'REPORT_CONFIRMED':
        console.log('신고가 접수되었습니다:', data.messageId);
        break;
        
      case 'JOIN_SUCCESS':
        console.log('지역 채팅방 입장 성공:', data.region);
        if (data.messages) {
          setMessages(data.messages.map(msg => ({
            ...msg,
            isOwn: msg.userId === userId
          })));
        }
        if (data.userCount) {
          setOnlineUsers(data.userCount);
        }
        break;
        
      case 'LEAVE_SUCCESS':
        console.log('지역 채팅방 퇴장 성공');
        setMessages([]);
        setOnlineUsers(0);
        break;
        
      default:
        console.log('알 수 없는 메시지 타입:', data.type, data);
    }
  }, [userId]);

  // 연결 상태 핸들러
  const handleConnectionStatus = useCallback(async (status) => {
    console.log('연결 상태 변경:', status);
    setConnectionStatus(status);
    
    // 연결 성공 시 자동으로 지역 입장은 ChatWebSocketManager에서 처리
    
    if (status === 'error' || status === 'max_retries_exceeded') {
      setError('연결에 문제가 발생했습니다. 페이지를 새로고침해주세요.');
      setMessages([]);
      setOnlineUsers(0);
    }
    
    if (status === 'disconnected') {
      setOnlineUsers(0);
    }
  }, []);

  // WebSocket 초기화 (컴포넌트 마운트 시 한 번만)
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    messageHandlerRef.current = handleMessage;
    connectionHandlerRef.current = handleConnectionStatus;
    
    chatWebSocketManager.addMessageHandler(handleMessage);
    chatWebSocketManager.addConnectionHandler(handleConnectionStatus);
    
    isInitializedRef.current = true;

    return () => {
      if (isInitializedRef.current) {
        chatWebSocketManager.removeMessageHandler(handleMessage);
        chatWebSocketManager.removeConnectionHandler(handleConnectionStatus);
        isInitializedRef.current = false;
      }
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 핸들러 업데이트
  useEffect(() => {
    messageHandlerRef.current = handleMessage;
    connectionHandlerRef.current = handleConnectionStatus;
  }, [handleMessage, handleConnectionStatus]);

  // 지역/사용자 정보 변경 시 채팅방 입장/퇴장
  useEffect(() => {
    if (!isInitializedRef.current || !region || !userId || !userNickname) return;

    const handleRegionChange = async () => {
      try {
        // 연결되지 않은 경우 연결 시도
        if (!chatWebSocketManager.isConnected()) {
          console.log('WebSocket 연결 시도...');
          await chatWebSocketManager.connect();
        }

        // 지역 입장
        console.log(`지역 채팅방 입장: ${region}`);
        const success = await chatWebSocketManager.joinRegion(region, userId, userNickname);
        if (!success) {
          console.error('지역 입장 실패');
          setError('채팅방 입장에 실패했습니다.');
        }
      } catch (error) {
        console.error('지역 변경 실패:', error);
        setError('채팅방 연결에 실패했습니다.');
      }
    };

    handleRegionChange();
  }, [region, userId, userNickname]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (isInitializedRef.current) {
        console.log('useChatWebSocket 정리');
        chatWebSocketManager.removeMessageHandler(handleMessage);
        chatWebSocketManager.removeConnectionHandler(handleConnectionStatus);
        // 연결은 유지하되 현재 지역에서만 퇴장
        if (chatWebSocketManager.isConnected()) {
          chatWebSocketManager.leaveRegion();
        }
      }
    };
  }, []);

  // 메시지 전송
  const sendMessage = useCallback(async (content) => {
    if (!content?.trim()) {
      setError('메시지를 입력해주세요.');
      return false;
    }

    if (!region || !userId || !userNickname) {
      setError('사용자 정보가 없습니다.');
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const success = await chatWebSocketManager.sendMessage(content.trim(), region, userId, userNickname);
      if (!success) {
        setError('메시지 전송에 실패했습니다.');
      }
      return success;
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      setError('메시지 전송에 실패했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [region, userId, userNickname]);

  // 메시지 삭제
  const deleteMessage = useCallback(async (messageId) => {
    if (!messageId || !userId) return false;

    try {
      const success = await chatWebSocketManager.deleteMessage(messageId, userId);
      if (!success) {
        setError('메시지 삭제에 실패했습니다.');
      }
      return success;
    } catch (error) {
      console.error('메시지 삭제 실패:', error);
      setError('메시지 삭제에 실패했습니다.');
      return false;
    }
  }, [userId]);

  // 메시지 신고
  const reportMessage = useCallback(async (messageId, reason) => {
    if (!messageId || !reason || !userId || !userNickname) return false;

    try {
      const success = await chatWebSocketManager.reportMessage(messageId, reason, userId, userNickname);
      if (success) {
        console.log('신고가 접수되었습니다.');
      } else {
        setError('신고 접수에 실패했습니다.');
      }
      return success;
    } catch (error) {
      console.error('메시지 신고 실패:', error);
      setError('신고 접수에 실패했습니다.');
      return false;
    }
  }, [userId, userNickname]);

  // 수동 연결 시도
  const reconnect = useCallback(async () => {
    setError(null);
    try {
      await chatWebSocketManager.connect();
      if (region && userId && userNickname) {
        await chatWebSocketManager.joinRegion(region, userId, userNickname);
      }
    } catch (error) {
      console.error('재연결 실패:', error);
      setError('재연결에 실패했습니다.');
    }
  }, [region, userId, userNickname]);

  return {
    connectionStatus,
    messages,
    onlineUsers,
    error,
    isLoading,
    sendMessage,
    deleteMessage,
    reportMessage,
    reconnect,
    isConnected: connectionStatus === 'connected',
    clearError: () => setError(null)
  };
};