// src/api/auth.js (완전한 버전)
import axios from "axios";

const API_URL = "http://localhost:8081/api/auth";

// 로그인 함수
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/signin`, {
      username,
      password,
    });

    const { accessToken, username: user, role } = response.data;
    
    // 토큰과 사용자 정보 저장
    localStorage.setItem("token", accessToken);
    localStorage.setItem("username", user);
    localStorage.setItem("role", role);

    console.log("로그인 응답:", response.data);
    return { token: accessToken, username: user, role };

    
  } catch (error) {
    console.error("Login error:", error);
    throw error.response?.data || "로그인 실패";
  }
};

// 회원가입 함수
export const register = async (username, nickname, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, {
      username,
      nickname,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    throw error.response?.data || "회원가입 실패";
  }
};

// 중복 확인 함수
export const checkDuplicate = async (field, value) => {
  try {
    const response = await axios.get(`${API_URL}/check-duplicate`, {
      params: {
        field,
        value
      }
    });

    return {
      available: response.data.available,
      message: response.data.message,
      field: response.data.field,
      value: response.data.value
    };
  } catch (error) {
    console.error("Duplicate check error:", error);
    throw error.response?.data || "중복 확인 실패";
  }
};

// 현재 사용자 정보 가져오기 (localStorage에서)
export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (!token) {
      return { token: null, username: null, role: null };
    }

    return {
      token,
      username,
      role,
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return { token: null, username: null, role: null };
  }
};

// 로그아웃 함수
export const logout = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    console.log("로그아웃 완료");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// 인증 상태 확인
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// 관리자 권한 확인
export const isAdmin = () => {
  const role = localStorage.getItem("role");
  return role === "ADMIN";
};

// 토큰 유효성 검사 (JWT 디코딩)
export const isTokenValid = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;

    // JWT 토큰 디코딩 (간단한 만료 확인)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp > currentTime;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

// 토큰 갱신이 필요한지 확인
export const shouldRefreshToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const timeToExpiry = payload.exp - currentTime;
    
    // 토큰이 5분 이내에 만료되면 갱신 필요
    return timeToExpiry < 300;
  } catch (error) {
    console.error("Token refresh check error:", error);
    return false;
  }
};

// 사용자 역할 기반 접근 권한 확인
export const hasPermission = (requiredRole) => {
  const userRole = localStorage.getItem("role");
  
  if (requiredRole === "ADMIN") {
    return userRole === "ADMIN";
  }
  
  if (requiredRole === "USER") {
    return userRole === "USER" || userRole === "ADMIN";
  }
  
  return false;
};

// 자동 로그아웃 (토큰 만료 시)
export const autoLogout = () => {
  if (!isTokenValid()) {
    logout();
    window.location.href = '/login';
    return true;
  }
  return false;
};

// 인증 헤더 생성
export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ===== 추가 유틸리티 함수들 =====

// 사용자 정보 업데이트 (로그인 상태에서)
export const updateUserInfo = (newUserData) => {
  try {
    if (newUserData.username) {
      localStorage.setItem("username", newUserData.username);
    }
    if (newUserData.role) {
      localStorage.setItem("role", newUserData.role);
    }
    return true;
  } catch (error) {
    console.error("Update user info error:", error);
    return false;
  }
};

// 로그인 상태 변경 리스너 (다른 탭에서 로그아웃 시 동기화)
export const setupAuthStateListener = (callback) => {
  const handleStorageChange = (e) => {
    if (e.key === 'token') {
      if (!e.newValue) {
        // 토큰이 제거되면 로그아웃 상태로 변경
        callback({ type: 'logout' });
      } else {
        // 새 토큰이 설정되면 로그인 상태로 변경
        const userData = getCurrentUser();
        callback({ type: 'login', userData });
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);
  
  // 리스너 제거 함수 반환
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

// ===== 중복 확인 관련 유틸리티 함수들 =====

// 아이디 중복 확인
export const checkUsernameAvailability = async (username) => {
  return await checkDuplicate('username', username);
};

// 닉네임 중복 확인
export const checkNicknameAvailability = async (nickname) => {
  return await checkDuplicate('nickname', nickname);
};

// 이메일 중복 확인
export const checkEmailAvailability = async (email) => {
  return await checkDuplicate('email', email);
};

// ===== 아이디/비밀번호 찾기 함수들 =====

// 아이디 찾기 (이메일로)
export const findUsername = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/find-username`, {
      email
    });
    
    return {
      username: response.data.username,
      message: response.data.message
    };
  } catch (error) {
    console.error("Find username error:", error);
    throw error.response?.data || "아이디 찾기 실패";
  }
};

// 비밀번호 재설정 (임시 비밀번호 이메일 발송)
export const resetPassword = async (username, email) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, {
      username,
      email
    });
    
    return {
      message: response.data.message,
      success: response.data.success
    };
  } catch (error) {
    console.error("Reset password error:", error);
    throw error.response?.data || "비밀번호 재설정 실패";
  }
};

// 전체 폼 중복 확인 (회원가입 전 최종 검증)
export const validateRegistrationForm = async (formData) => {
  try {
    const { username, nickname, email } = formData;
    
    const checks = await Promise.all([
      checkUsernameAvailability(username),
      checkNicknameAvailability(nickname),
      checkEmailAvailability(email)
    ]);

    const [usernameCheck, nicknameCheck, emailCheck] = checks;

    return {
      isValid: usernameCheck.available && nicknameCheck.available && emailCheck.available,
      results: {
        username: usernameCheck,
        nickname: nicknameCheck,
        email: emailCheck
      }
    };
  } catch (error) {
    console.error("Form validation error:", error);
    throw error;
  }
};

// 기본 export (호환성을 위해)
export default {
  login,
  register,
  checkDuplicate,
  checkUsernameAvailability,
  checkNicknameAvailability,
  checkEmailAvailability,
  findUsername,
  resetPassword,
  validateRegistrationForm,
  logout,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  isTokenValid,
  shouldRefreshToken,
  hasPermission,
  autoLogout,
  getAuthHeader,
  updateUserInfo,
  setupAuthStateListener
};