// src/api/admin.js
import axiosInstance from './axiosInstance';

// ===== 대시보드 =====

export const fetchDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/dashboard');
    return response.data;
  } catch (error) {
    console.error('Dashboard stats fetch failed:', error);
    // 실패해도 더미 데이터 반환하여 UI가 깨지지 않도록 함
    return {
      totalUsers: 0,
      pendingInquiries: 0,
      activeFestivals: 0,
      activeChatUsers: 0,
      onlineUsers: 0,
      todayNewUsers: 0,
      totalInquiries: 0,
      answeredInquiries: 0,
      newUsersThisMonth: 0
    };
  }
};

// ===== 사용자 관리 =====

export const fetchUsers = async (page = 0, size = 10, isActive = null, search = '') => {
  try {
    const params = new URLSearchParams();
    
    // 파라미터를 명시적으로 설정
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    // null이 아닌 경우에만 추가
    if (isActive !== null && isActive !== undefined) {
      params.append('isActive', isActive.toString());
    }
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    
    console.log('Fetching users with params:', params.toString());
    
    const response = await axiosInstance.get(`/api/admin/users?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Users fetch failed:', error);
    // 실패시 빈 페이지 데이터 반환
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
      first: true,
      last: true
    };
  }
};

export const fetchUser = async (userId) => {
  try {
    const response = await axiosInstance.get(`/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('User detail fetch failed:', error);
    throw new Error(error.response?.data?.message || '사용자 정보를 불러올 수 없습니다.');
  }
};

export const toggleUserStatus = async (userId) => {
  try {
    const response = await axiosInstance.put(`/api/admin/users/${userId}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('User status toggle failed:', error);
    throw new Error(error.response?.data?.message || '사용자 상태를 변경할 수 없습니다.');
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('User delete failed:', error);
    throw new Error(error.response?.data?.message || '사용자를 삭제할 수 없습니다.');
  }
};

// ===== 문의 관리 =====

export const fetchInquiries = async (page = 0, size = 10, status = null, search = '', sortBy = 'createdAt', sortDir = 'desc') => {
  try {
    const params = new URLSearchParams();
    
    // 기본 파라미터
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sort', `${sortBy},${sortDir}`);
    
    // 선택적 파라미터
    if (status && status !== 'all') {
      params.append('status', status);
    }
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    
    console.log('Fetching inquiries with params:', params.toString());
    
    const response = await axiosInstance.get(`/api/admin/inquiries?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Inquiries fetch failed:', error);
    // 실패시 빈 페이지 데이터 반환
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page,
      first: true,
      last: true
    };
  }
};

export const fetchInquiryDetail = async (inquiryId) => {
  try {
    const response = await axiosInstance.get(`/api/admin/inquiries/${inquiryId}`);
    return response.data;
  } catch (error) {
    console.error('Inquiry detail fetch failed:', error);
    throw new Error(error.response?.data?.message || '문의 상세 정보를 불러올 수 없습니다.');
  }
};

export const answerInquiry = async (inquiryId, answer) => {
  try {
    const response = await axiosInstance.post(`/api/admin/inquiries/${inquiryId}/answer`, {
      answer
    });
    return response.data;
  } catch (error) {
    console.error('Inquiry answer failed:', error);
    throw new Error(error.response?.data?.message || '문의 답변에 실패했습니다.');
  }
};

export const deleteInquiry = async (inquiryId) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/inquiries/${inquiryId}`);
    return response.data;
  } catch (error) {
    console.error('Inquiry delete failed:', error);
    throw new Error(error.response?.data?.message || '문의를 삭제할 수 없습니다.');
  }
};

// ===== 최근 데이터 (대시보드용) - 실패해도 빈 배열 반환 =====

export const fetchRecentUsers = async (limit = 5) => {
  try {
    const response = await axiosInstance.get(`/api/admin/recent/users?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Recent users fetch failed:', error);
    return []; // 빈 배열 반환
  }
};

export const fetchRecentInquiries = async (limit = 5) => {
  try {
    const response = await axiosInstance.get(`/api/admin/recent/inquiries?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Recent inquiries fetch failed:', error);
    return []; // 빈 배열 반환
  }
};

// ===== 통계 =====

export const fetchUserGrowthStats = async (days = 30) => {
  try {
    const response = await axiosInstance.get(`/api/admin/stats/user-growth?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('User growth stats fetch failed:', error);
    // 더미 데이터 반환
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      newUsers: Math.floor(Math.random() * 10),
      userCount: 100 + i * 2
    }));
  }
};

export const fetchInquiryStats = async (days = 30) => {
  try {
    const response = await axiosInstance.get(`/api/admin/stats/inquiry-trend?days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Inquiry stats fetch failed:', error);
    return {
      data: [],
      avgResponseTime: 0
    };
  }
};

export const fetchRegionalChatStats = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/stats/regional-chat');
    return response.data;
  } catch (error) {
    console.error('Regional chat stats fetch failed:', error);
    // 더미 지역 데이터 반환
    return [
      { region: '서울', activeUsers: 45, messageCount: 234 },
      { region: '부산', activeUsers: 23, messageCount: 156 },
      { region: '대구', activeUsers: 18, messageCount: 89 },
      { region: '인천', activeUsers: 31, messageCount: 178 },
      { region: '광주', activeUsers: 12, messageCount: 67 }
    ];
  }
};

// ===== 채팅 관리 =====

export const fetchChatMessages = async (page = 0, size = 20, region = null, status = null) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    if (region && region !== 'all') {
      params.append('region', region);
    }
    if (status && status !== 'all') {
      params.append('status', status);
    }
    
    const response = await axiosInstance.get(`/api/admin/chat/messages?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Chat messages fetch failed:', error);
    // 채팅 기능이 아직 구현되지 않은 경우 빈 페이지 반환
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page
    };
  }
};

export const deleteChatMessage = async (messageId) => {
  try {
    const response = await axiosInstance.delete(`/api/admin/chat/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Chat message delete failed:', error);
    throw new Error(error.response?.data?.message || '메시지를 삭제할 수 없습니다.');
  }
};

export const blockChatUser = async (userId, reason = '부적절한 행동') => {
  try {
    const response = await axiosInstance.post(`/api/admin/chat/users/${userId}/block`, {
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Chat user block failed:', error);
    throw new Error(error.response?.data?.message || '사용자를 차단할 수 없습니다.');
  }
};

// ===== 검색 =====

export const searchUsers = async (keyword, page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get(`/api/admin/search/users`, {
      params: { keyword, page, size }
    });
    return response.data;
  } catch (error) {
    console.error('User search failed:', error);
    return { content: [], totalPages: 0, totalElements: 0 };
  }
};

export const searchInquiries = async (keyword, page = 0, size = 10) => {
  try {
    const response = await axiosInstance.get(`/api/admin/search/inquiries`, {
      params: { keyword, page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Inquiry search failed:', error);
    return { content: [], totalPages: 0, totalElements: 0 };
  }
};

// ===== 데이터 내보내기 =====

export const exportData = async (type, format = 'excel', filters = {}) => {
  try {
    const response = await axiosInstance.post(`/api/admin/export/${type}`, {
      format,
      filters
    }, {
      responseType: 'blob'
    });
    
    // 파일 다운로드 처리
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Data export failed:', error);
    throw new Error(error.response?.data?.message || '데이터 내보내기에 실패했습니다.');
  }
};

// ===== 실시간 통계 구독 =====

export const subscribeToRealTimeStats = (onDataReceived) => {
  try {
    const eventSource = new EventSource('/api/admin/stats/realtime');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onDataReceived(data);
    };
    
    eventSource.onerror = (error) => {
      console.error('Real-time stats connection error:', error);
      eventSource.close();
    };
    
    return eventSource;
  } catch (error) {
    console.error('Real-time stats subscription failed:', error);
    return null;
  }
};

// ===== 유틸리티 =====

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Date formatting failed:', error);
    return dateString;
  }
};

export const formatNumber = (number) => {
  if (typeof number !== 'number' || isNaN(number)) return '0';
  return number.toLocaleString('ko-KR');
};