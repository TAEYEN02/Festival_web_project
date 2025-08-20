// src/api/admin.js
import axiosInstance from "./axiosInstance";

// 대시보드 통계 불러오기
export const fetchDashboardStats = async () => {
  const response = await axiosInstance.get("/admin/dashboard/stats");
  return response.data;
};

// 사용자 목록 불러오기
export const fetchUsers = async (page = 0, size = 10) => {
  const response = await axiosInstance.get("/admin/users", {
    params: { page, size },
  });
  return response.data;
};
