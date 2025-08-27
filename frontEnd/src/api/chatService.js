import axiosInstance from './axiosInstance';
import { chatWebSocketManager } from '../websocket/ChatWebSocketManager';

// HTTP API (백업용)
export const chatAPI = {
  // 지역별 메시지 조회
  getRegionalMessages: async (region, page = 0, size = 50) => {
    try {
      const response = await axiosInstance.get(`/api/mypage/regional-chat/${encodeURIComponent(region)}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('지역 메시지 조회 실패:', error);
      throw error;
    }
  },

  // 메시지 전송 (HTTP - 백업용)
  sendMessage: async (messageData) => {
    try {
      const response = await axiosInstance.post('/api/mypage/regional-chat', messageData);
      return response.data;
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      throw error;
    }
  },

  // 메시지 삭제
  deleteMessage: async (messageId) => {
    try {
      const response = await axiosInstance.delete(`/api/mypage/regional-chat/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('메시지 삭제 실패:', error);
      throw error;
    }
  },

  // 사용자 메시지 조회
  getUserMessages: async (page = 0, size = 20) => {
    try {
      const response = await axiosInstance.get('/api/mypage/regional-chat/my-messages', {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('사용자 메시지 조회 실패:', error);
      throw error;
    }
  }
};

// 관리자 채팅 API
export const adminChatAPI = {
  // 실시간 통계
  getRealTimeStats: async () => {
    try {
      const response = await axiosInstance.get('/api/admin/chat/stats/realtime');
      return response.data;
    } catch (error) {
      console.error('실시간 통계 조회 실패:', error);
      throw error;
    }
  },

  // 지역별 통계
  getRegionalStats: async () => {
    try {
      const response = await axiosInstance.get('/api/admin/stats/regional-chat');
      return response.data;
    } catch (error) {
      console.error('지역별 통계 조회 실패:', error);
      throw error;
    }
  },

  // 신고 목록 조회
  getReports: async (status = 'all', region = 'all', page = 0, size = 20) => {
    try {
      const response = await axiosInstance.get('/api/admin/chat/reports', {
        params: { status, region, page, size }
      });
      return response.data;
    } catch (error) {
      console.error('신고 목록 조회 실패:', error);
      throw error;
    }
  },

  // 신고 처리
  resolveReport: async (reportId, resolution) => {
    try {
      const response = await axiosInstance.put(`/api/admin/chat/reports/${reportId}/resolve`, resolution);
      return response.data;
    } catch (error) {
      console.error('신고 처리 실패:', error);
      throw error;
    }
  },

  // 메시지 삭제 (관리자)
  deleteMessage: async (messageId) => {
    try {
      const response = await axiosInstance.delete(`/api/admin/chat/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('관리자 메시지 삭제 실패:', error);
      throw error;
    }
  },

  // 사용자 차단
  blockUser: async (userId, reason) => {
    try {
      const response = await axiosInstance.post(`/api/admin/chat/users/${userId}/block`, { reason });
      return response.data;
    } catch (error) {
      console.error('사용자 차단 실패:', error);
      throw error;
    }
  }
};

export { chatWebSocketManager };