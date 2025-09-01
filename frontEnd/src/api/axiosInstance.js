// src/api/axiosInstance.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';

// 기본 Axios 인스턴스
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true 
});

// 요청 인터셉터: 토큰 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 에러 처리 및 토큰 갱신
axiosInstance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', accessToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          handleLogout();
          return Promise.reject(refreshError);
        }
      }
    }

    if (error.response?.status === 403 || (error.response?.status === 401 && !localStorage.getItem('refreshToken'))) {
      handleLogout();
    }

    if (!error.response) {
      const networkError = new Error('네트워크 연결을 확인해주세요.');
      networkError.code = 'NETWORK_ERROR';
      return Promise.reject(networkError);
    }

    if (error.response.status >= 500) {
      const serverError = new Error('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      serverError.code = 'SERVER_ERROR';
      return Promise.reject(serverError);
    }

    return Promise.reject(error);
  }
);

// 로그아웃
const handleLogout = () => {
  ['token', 'refreshToken', 'user'].forEach((key) => localStorage.removeItem(key));
  if (window.location.pathname !== '/login') {
    window.location.href = '/login?expired=true';
  }
};

// SSE / 실시간용 Axios-like config 생성
export const createRealtimeConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Cache-Control': 'no-cache',
      Accept: 'text/event-stream',
    },
  };
};

// 파일 업로드 인스턴스
export const createFileUploadInstance = () =>
  axios.create({
    ...axiosInstance.defaults,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });

// 다운로드 인스턴스
export const createDownloadInstance = () =>
  axios.create({
    ...axiosInstance.defaults,
    responseType: 'blob',
    timeout: 120000,
  });

// API 상태 확인
export const checkApiHealth = async () => {
  try {
    const response = await axiosInstance.get('/health');
    return { status: 'healthy', latency: response.headers['x-response-time'] || 'unknown', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
};

// 재시도 가능한 요청
export const retryableRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (i === maxRetries || error.response?.status < 500 || error.code === 'NETWORK_ERROR') break;
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      console.warn(`Request failed, retrying... (${i + 1}/${maxRetries})`, error.message);
    }
  }
  throw lastError;
};

// 요청 취소 매니저
class RequestManager {
  constructor() {
    this.controllers = new Map();
  }
  register(key, controller) {
    if (this.controllers.has(key)) this.controllers.get(key).abort();
    this.controllers.set(key, controller);
  }
  cancel(key) {
    if (this.controllers.has(key)) {
      this.controllers.get(key).abort();
      this.controllers.delete(key);
    }
  }
  cancelAll() {
    for (const [key, controller] of this.controllers) controller.abort();
    this.controllers.clear();
  }
  complete(key) {
    this.controllers.delete(key);
  }
}
export const requestManager = new RequestManager();

// 캐시
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;
export const cachedRequest = async (key, requestFn, duration = CACHE_DURATION) => {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && now - cached.timestamp < duration) return cached.data;
  try {
    const data = await requestFn();
    cache.set(key, { data, timestamp: now });
    return data;
  } catch (error) {
    if (cached) {
      console.warn('Using stale cache due to request error:', error.message);
      return cached.data;
    }
    throw error;
  }
};
export const clearCache = (pattern) => {
  if (pattern) {
    for (const key of cache.keys()) if (key.includes(pattern)) cache.delete(key);
  } else cache.clear();
};

export default axiosInstance;
