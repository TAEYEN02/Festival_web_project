// src/api/auth.js
import axios from "axios";

const API_URL = "http://localhost:8081/api/auth"; // 배포된 백엔드 주소

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/signin`, {
      username,
      password,
    });

    const token = response.data.accessToken;
    // JWT 저장 (localStorage or sessionStorage)
    localStorage.setItem("token", token);

    return token;
  } catch (error) {
    throw error.response?.data || "로그인 실패";
  }
};

export const register = async (username, nickname, email, password, roles = ["ROLE_USER"]) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, {
      username,
      nickname,
      email,
      password,
      roles, // roles를 직접 넘길 수 있게
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || "회원가입 실패";
  }
};