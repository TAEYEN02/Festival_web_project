export class ChatError extends Error {
  constructor(message, code, data = null) {
    super(message);
    this.name = 'ChatError';
    this.code = code;
    this.data = data;
  }
}

export const handleChatError = (error, showNotification = true) => {
  let message = '알 수 없는 오류가 발생했습니다.';
  
  if (error instanceof ChatError) {
    message = error.message;
  } else if (error.response) {
    // HTTP 오류
    switch (error.response.status) {
      case 401:
        message = '로그인이 필요합니다.';
        break;
      case 403:
        message = '권한이 없습니다.';
        break;
      case 429:
        message = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
        break;
      case 500:
        message = '서버 오류가 발생했습니다.';
        break;
      default:
        message = error.response.data?.message || '서버 오류가 발생했습니다.';
    }
  } else if (error.code === 'NETWORK_ERROR') {
    message = '네트워크 연결을 확인해주세요.';
  }

  if (showNotification) {
    // 실제 구현에서는 toast 알림 등을 사용
    console.error('Chat Error:', message, error);
  }
  
  return message;
};

export const showErrorNotification = (message) => {
  // TODO: 실제 토스트 알림 구현
  console.error('Notification:', message);
  alert(message); // 임시 알림
};

export const showSuccessNotification = (message) => {
  // TODO: 실제 토스트 알림 구현
  console.log('Success:', message);
};

// 채팅 관련 에러 처리 유틸리티
export const handleWebSocketError = (error) => {
  let message = '채팅 연결에 문제가 발생했습니다.';
  
  if (error.type === 'error') {
    message = '네트워크 연결을 확인해주세요.';
  } else if (error.code === 1006) {
    message = '서버와의 연결이 끊어졌습니다. 재연결을 시도합니다.';
  }
  
  return message;
};