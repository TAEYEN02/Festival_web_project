import axiosInstance from "./axiosInstance";

// 현재 사용자 정보 조회
export const fetchCurrentUserInfo = async () => {
  const response = await axiosInstance.get("/api/user/me");
  return response.data;
};

// 사용자 정보 수정
export const updateUserInfo = async (userInfo) => {
  const response = await axiosInstance.put("/api/user/me", userInfo);
  return response.data;
};

// 비밀번호 변경 (추가)
export const changePassword = async (passwordData) => {
  const response = await axiosInstance.put("/api/user/change-password", passwordData);
  return response.data;
};
