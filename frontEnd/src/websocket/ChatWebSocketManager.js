class ChatWebSocketManager {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnecting = false;
    this.messageHandlers = new Set();
    this.connectionHandlers = new Set();
    this.messageQueue = []; // 연결 대기 중인 메시지들을 저장
    this.connectionPromise = null; // 연결 완료를 기다리는 Promise
    this.currentRegion = null;
    this.currentUserId = null;
    this.currentNickname = null;
  }

  connect(wsUrl = null) {
    if (this.isConnecting) {
      return this.connectionPromise || Promise.resolve();
    }
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    this.isConnecting = true;
    const url = wsUrl || this.getWebSocketUrl();

    console.log('WebSocket 연결 시도:', url);

    // 기존 연결이 있으면 정리
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // 연결 Promise 생성
    this.connectionPromise = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        console.error('WebSocket 연결 타임아웃');
        this.isConnecting = false;
        this.connectionPromise = null;
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }
        reject(new Error('Connection timeout'));
        this.scheduleReconnect();
      }, 10000); // 10초 타임아웃

      try {
        this.ws = new WebSocket(url);
        this.setupEventListeners(resolve, reject, timeoutId);
      } catch (error) {
        console.error('WebSocket 연결 생성 실패:', error);
        clearTimeout(timeoutId);
        this.isConnecting = false;
        this.connectionPromise = null;
        reject(error);
        this.scheduleReconnect();
      }
    });

    return this.connectionPromise;
  }

  getWebSocketUrl() {
    // baseUrl.js의 WS_URL 사용하거나 기본값
    const baseWsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';
    return `${baseWsUrl}/ws/chat`;
  }

  setupEventListeners(resolve, reject, timeoutId) {
    this.ws.onopen = () => {
      console.log('WebSocket 연결 성공');
      clearTimeout(timeoutId);
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      
      this.notifyConnectionHandlers('connected');
      
      // 이전 지역이 있으면 자동 재입장
      if (this.currentRegion && this.currentUserId && this.currentNickname) {
        setTimeout(() => {
          this.joinRegion(this.currentRegion, this.currentUserId, this.currentNickname);
        }, 100);
      }
      
      // 대기 중인 메시지들 전송
      this.processPendingMessages();
      
      resolve();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket 메시지 수신:', data);
        this.notifyMessageHandlers(data);
      } catch (error) {
        console.error('WebSocket 메시지 파싱 실패:', error, event.data);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket 연결 종료:', event.code, event.reason);
      clearTimeout(timeoutId);
      this.isConnecting = false;
      this.connectionPromise = null;
      
      this.notifyConnectionHandlers('disconnected');
      
      // 비정상 종료인 경우만 재연결 시도
      if (event.code !== 1000 && event.code !== 1001) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket 오류:', error);
      clearTimeout(timeoutId);
      this.isConnecting = false;
      this.connectionPromise = null;
      
      this.notifyConnectionHandlers('error');
      
      if (this.reconnectAttempts === 0) {
        reject(error);
      }
    };
  }

  // 대기 중인 메시지들 처리
  processPendingMessages() {
    if (!this.isConnected()) return;
    
    const messages = [...this.messageQueue];
    this.messageQueue = [];
    
    messages.forEach(message => {
      try {
        this.sendImmediately(message);
      } catch (error) {
        console.error('대기 메시지 전송 실패:', error);
        // 실패한 메시지는 다시 큐에 추가하지 않음 (무한 루프 방지)
      }
    });
  }

  // 즉시 전송 (내부용)
  sendImmediately(message) {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }
    
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    this.ws.send(messageStr);
    console.log('WebSocket 메시지 전송:', message);
    return true;
  }

  // 메시지 전송 (연결 대기 처리 포함)
  async send(message) {
    // 연결되어 있으면 즉시 전송
    if (this.isConnected()) {
      try {
        return this.sendImmediately(message);
      } catch (error) {
        console.error('메시지 전송 실패:', error);
        return false;
      }
    }

    // 연결 중이면 큐에 추가하고 연결 완료 대기
    if (this.isConnecting && this.connectionPromise) {
      console.log('연결 중... 메시지 큐에 추가');
      this.messageQueue.push(message);
      try {
        await this.connectionPromise;
        // 연결되면 processPendingMessages에서 자동 전송됨
        return true;
      } catch (error) {
        console.error('연결 대기 중 오류:', error);
        return false;
      }
    }

    // 연결되지 않았으면 큐에 추가하고 연결 시도
    console.log('연결되지 않음. 큐에 추가하고 연결 시도');
    this.messageQueue.push(message);
    
    try {
      await this.connect();
      return true;
    } catch (error) {
      console.error('연결 실패:', error);
      // 연결 실패 시 큐에서 해당 메시지 제거
      const index = this.messageQueue.indexOf(message);
      if (index > -1) {
        this.messageQueue.splice(index, 1);
      }
      return false;
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('최대 재연결 시도 횟수 초과');
      this.notifyConnectionHandlers('max_retries_exceeded');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

    console.log(`${delay}ms 후 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected() && !this.isConnecting) {
        this.connect();
      }
    }, delay);
  }

  // 메시지 핸들러 등록
  addMessageHandler(handler) {
    this.messageHandlers.add(handler);
  }

  removeMessageHandler(handler) {
    this.messageHandlers.delete(handler);
  }

  // 연결 상태 핸들러 등록
  addConnectionHandler(handler) {
    this.connectionHandlers.add(handler);
  }

  removeConnectionHandler(handler) {
    this.connectionHandlers.delete(handler);
  }

  notifyMessageHandlers(data) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('메시지 핸들러 실행 오류:', error);
      }
    });
  }

  notifyConnectionHandlers(status) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (error) {
        console.error('연결 핸들러 실행 오류:', error);
      }
    });
  }

  // 지역 채팅방 입장
  async joinRegion(region, userId, nickname) {
    this.currentRegion = region;
    this.currentUserId = userId;
    this.currentNickname = nickname;
    
    return await this.send({
      type: 'JOIN_REGION',
      region,
      userId,
      nickname
    });
  }

  // 지역 채팅방 퇴장
  async leaveRegion() {
    const result = await this.send({
      type: 'LEAVE_REGION'
    });
    
    // 현재 지역 정보 초기화
    this.currentRegion = null;
    this.currentUserId = null;
    this.currentNickname = null;
    
    return result;
  }

  // 메시지 전송
  async sendMessage(content, region, userId, nickname) {
    return await this.send({
      type: 'SEND_MESSAGE',
      content,
      region,
      userId,
      nickname,
      timestamp: new Date().toISOString()
    });
  }

  // 메시지 삭제
  async deleteMessage(messageId, userId) {
    return await this.send({
      type: 'DELETE_MESSAGE',
      messageId,
      userId
    });
  }

  // 메시지 신고
  async reportMessage(messageId, reason, reporterId, reporterNickname) {
    return await this.send({
      type: 'REPORT_MESSAGE',
      messageId,
      reason,
      reporterId,
      reporterNickname
    });
  }

  // 연결 종료
  disconnect() {
    console.log('WebSocket 연결 종료 요청');
    
    // 현재 정보 초기화
    this.currentRegion = null;
    this.currentUserId = null;
    this.currentNickname = null;
    
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
    
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.messageQueue = [];
    this.connectionPromise = null;
    
    // 핸들러는 유지 (재연결 시 필요)
    this.notifyConnectionHandlers('disconnected');
  }

  // 완전한 정리 (컴포넌트 언마운트 시)
  destroy() {
    this.disconnect();
    this.messageHandlers.clear();
    this.connectionHandlers.clear();
  }

  // 연결 상태 확인
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionState() {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }
}

// 싱글톤 인스턴스
export const chatWebSocketManager = new ChatWebSocketManager();