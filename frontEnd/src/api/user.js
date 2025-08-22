import axiosInstance from "./axiosInstance";

// 현재 사용자 정보 조회
export const fetchCurrentUserInfo = async () => {
  const response = await axiosInstance.get("/user/me");
  return response.data;
};

// 사용자 정보 수정
export const updateUserInfo = async (userInfo) => {
  const response = await axiosInstance.put("/user/me", userInfo);
  return response.data;
};
