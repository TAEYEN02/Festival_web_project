import axiosInstance from "./axiosInstance";

// ===== 문의 관련 API =====
export const fetchMyInquiries = async (page = 0, size = 10) => {
  const response = await axiosInstance.get("/api/mypage/inquiries", {
    params: { page, size }
  });
  return response.data;
};

export const createInquiry = async (inquiryData) => {
  const response = await axiosInstance.post("/api/mypage/inquiries", inquiryData);
  return response.data;
};

export const getInquiry = async (inquiryId) => {
  const response = await axiosInstance.get(`/api/mypage/inquiries/${inquiryId}`);
  return response.data;
};

// ===== 찜 목록 관련 API =====
export const fetchMyWishlist = async (page = 0, size = 10) => {
  const response = await axiosInstance.get("/api/mypage/wishlist", {
    params: { page, size }
  });
  return response.data;
};

export const addToWishlist = async (wishlistData) => {
  const response = await axiosInstance.post("/api/mypage/wishlist", wishlistData);
  return response.data;
};

export const removeFromWishlist = async (itemType, itemId) => {
  const response = await axiosInstance.delete(`/api/mypage/wishlist/${itemType}/${itemId}`);
  return response.data;
};

export const checkWishlist = async (itemType, itemId) => {
  const response = await axiosInstance.get(`/api/mypage/wishlist/check/${itemType}/${itemId}`);
  return response.data;
};

// ===== AI 일정 관련 API =====
export const fetchMyItineraries = async (page = 0, size = 10) => {
  const response = await axiosInstance.get("/api/mypage/itineraries", {
    params: { page, size }
  });
  return response.data;
};

export const saveItinerary = async (itineraryData) => {
  const response = await axiosInstance.post("/api/mypage/itineraries", itineraryData);
  return response.data;
};

export const deleteItinerary = async (itineraryId) => {
  const response = await axiosInstance.delete(`/api/mypage/itineraries/${itineraryId}`);
  return response.data;
};

// ===== 지역 채팅 관련 API =====
export const sendChatMessage = async (messageData) => {
  const response = await axiosInstance.post("/api/mypage/regional-chat", messageData);
  return response.data;
};

export const fetchRegionalMessages = async (region, page = 0, size = 20) => {
  const response = await axiosInstance.get(`/api/mypage/regional-chat/${region}`, {
    params: { page, size }
  });
  return response.data;
};

export const fetchMyMessages = async (page = 0, size = 20) => {
  const response = await axiosInstance.get("/api/mypage/regional-chat/my-messages", {
    params: { page, size }
  });
  return response.data;
};

export const deleteChatMessage = async (messageId) => {
  const response = await axiosInstance.delete(`/api/mypage/regional-chat/${messageId}`);
  return response.data;
};
