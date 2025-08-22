// src/api/admin.js
import axiosInstance from "./axiosInstance";

// 대시보드 통계 불러오기
export const fetchDashboardStats = async () => {
  try {
    const response = await axiosInstance.get("/admin/dashboard");
    return response.data;
  } catch (error) {
    console.warn('Dashboard API 연결 실패, 더미 데이터 사용:', error.message);
    // API 연결 실패 시 더미 데이터 반환
    return {
      totalUsers: 1247,
      pendingInquiries: 23,
      activeFestivals: 89,
      activeChatUsers: 156
    };
  }
};

// 사용자 목록 불러오기
export const fetchUsers = async (page = 0, size = 10, isActive = null) => {
  try {
    const params = { page, size };
    if (isActive !== null) params.isActive = isActive;
    
    console.log('fetchUsers 요청:', params);
    const response = await axiosInstance.get("/admin/users", { params });
    console.log('fetchUsers 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('Users API 실제 에러:', error.response?.status, error.response?.data);
    console.warn('Users API 연결 실패, 더미 데이터 사용:', error.message);
    // API 연결 실패 시 더미 데이터 반환
    return {
      content: [
        { 
          id: 1, 
          nickname: '최준호', 
          email: 'junho.choi@email.com', 
          createdAt: '2024-01-15T10:30:00Z', 
          isActive: true 
        },
        { 
          id: 2, 
          nickname: '한지민', 
          email: 'jimin.han@email.com', 
          createdAt: '2024-01-14T14:20:00Z', 
          isActive: true 
        },
        { 
          id: 3, 
          nickname: '오세훈', 
          email: 'sehoon.oh@email.com', 
          createdAt: '2024-01-13T09:15:00Z', 
          isActive: false 
        },
        { 
          id: 4, 
          nickname: '박민수', 
          email: 'minsu.park@email.com', 
          createdAt: '2024-01-12T16:45:00Z', 
          isActive: true 
        },
        { 
          id: 5, 
          nickname: '김소영', 
          email: 'soyoung.kim@email.com', 
          createdAt: '2024-01-11T11:30:00Z', 
          isActive: true 
        }
      ],
      totalElements: 1247,
      totalPages: 125,
      size: 10,
      number: 0
    };
  }
};

// 특정 사용자 조회
export const fetchUser = async (userId) => {
  try {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('User detail fetch error:', error);
    throw error;
  }
};

// 사용자 상태 토글
export const toggleUserStatus = async (userId) => {
  try {
    const response = await axiosInstance.put(`/admin/users/${userId}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('Toggle user status error:', error);
    throw error;
  }
};

// 문의 목록 조회
export const fetchInquiries = async (page = 0, size = 10, status = null) => {
  try {
    const params = { page, size };
    if (status) params.status = status;
    
    console.log('fetchInquiries 요청:', params);
    const response = await axiosInstance.get("/admin/inquiries", { params });
    console.log('fetchInquiries 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('Inquiries API 실제 에러:', error.response?.status, error.response?.data);
    console.warn('Inquiries API 연결 실패, 더미 데이터 사용:', error.message);
    // API 연결 실패 시 더미 데이터 반환
    return {
      content: [
        {
          id: 1,
          title: '축제 예매 관련 문의',
          userNickname: '김철수',
          status: 'PENDING',
          createdAt: '2024-01-15T10:30:00Z',
          category: '결제'
        },
        {
          id: 2,
          title: '회원정보 수정 오류',
          userNickname: '박영희',
          status: 'ANSWERED',
          createdAt: '2024-01-14T14:20:00Z',
          category: '기술'
        },
        {
          id: 3,
          title: '축제 정보 오류 신고',
          userNickname: '이민수',
          status: 'PENDING',
          createdAt: '2024-01-13T09:15:00Z',
          category: '일반'
        },
        {
          id: 4,
          title: '환불 요청',
          userNickname: '정수진',
          status: 'ANSWERED',
          createdAt: '2024-01-12T16:45:00Z',
          category: '결제'
        },
        {
          id: 5,
          title: '앱 사용법 문의',
          userNickname: '김동현',
          status: 'PENDING',
          createdAt: '2024-01-11T11:30:00Z',
          category: '기술'
        }
      ],
      totalElements: 156,
      totalPages: 16,
      size: 10,
      number: 0
    };
  }
};

// 문의 답변
export const answerInquiry = async (inquiryId, answer) => {
  try {
    const response = await axiosInstance.post(`/admin/inquiries/${inquiryId}/answer`, {
      answer
    });
    return response.data;
  } catch (error) {
    console.error('Answer inquiry error:', error);
    throw error;
  }
};

// 사용자 증가 통계
export const fetchUserGrowthStats = async (days = 30) => {
  try {
    const response = await axiosInstance.get(`/admin/stats/user-growth?days=${days}`);
    return response.data;
  } catch (error) {
    console.warn('User growth stats API 연결 실패, 더미 데이터 사용:', error.message);
    // API 연결 실패 시 더미 데이터 반환
    const stats = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      stats.push({
        date: date.toISOString().split('T')[0],
        userCount: Math.floor(Math.random() * 50) + 20,
        newUsers: Math.floor(Math.random() * 15) + 5
      });
    }
    return stats;
  }
};

// 지역별 채팅 통계
export const fetchRegionalChatStats = async () => {
  try {
    const response = await axiosInstance.get("/admin/stats/regional-chat");
    return response.data;
  } catch (error) {
    console.warn('Regional chat stats API 연결 실패, 더미 데이터 사용:', error.message);
    // API 연결 실패 시 더미 데이터 반환
    return [
      { region: '서울', activeUsers: 450, messageCount: 2340 },
      { region: '부산', activeUsers: 320, messageCount: 1890 },
      { region: '대구', activeUsers: 280, messageCount: 1560 },
      { region: '인천', activeUsers: 260, messageCount: 1420 },
      { region: '광주', activeUsers: 190, messageCount: 980 },
      { region: '대전', activeUsers: 170, messageCount: 890 },
      { region: '울산', activeUsers: 120, messageCount: 650 }
    ];
  }
};

// 문의 상세 조회 (추가)
export const fetchInquiryDetail = async (inquiryId) => {
  try {
    const response = await axiosInstance.get(`/admin/inquiries/${inquiryId}`);
    return response.data;
  } catch (error) {
    console.error('Inquiry detail fetch error:', error);
    throw error;
  }
};