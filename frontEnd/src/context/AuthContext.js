import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 초기 로드 시 JWT 토큰 체크 (한 번만 실행)
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Stored token exists:', !!token);
        console.log('Token length:', token ? token.length : 0);
        
        if (token && token.trim()) {
          // JWT 토큰 파싱 시도
          const parts = token.split('.');
          console.log('Token parts count:', parts.length);
          
          if (parts.length !== 3) {
            console.error('Invalid JWT token format - expected 3 parts, got:', parts.length);
            throw new Error(`Invalid JWT token format - expected 3 parts, got ${parts.length}`);
          }

          // Base64 패딩 수정
          let payload = parts[1];
          // Base64 패딩 추가 (4의 배수가 되도록)
          while (payload.length % 4) {
            payload += '=';
          }
          
          const decodedPayload = JSON.parse(atob(payload));
          console.log('Decoded JWT payload:', decodedPayload);
          
          // 토큰 만료 체크
          const currentTime = Date.now() / 1000;
          if (decodedPayload.exp && decodedPayload.exp < currentTime) {
            // 토큰 만료됨
            console.log('Token expired');
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
          } else {
            // 유효한 토큰 - JWT에서 role 정보 추출
            const roles = Array.isArray(decodedPayload.roles)
              ? decodedPayload.roles
              : Array.isArray(decodedPayload.authorities)
              ? decodedPayload.authorities
              : decodedPayload.roles
              ? String(decodedPayload.roles).split(',')
              : decodedPayload.role
              ? [decodedPayload.role] // 단일 role인 경우
              : ['ROLE_USER']; // 기본값
            
            const userData = {
              username: decodedPayload.sub || decodedPayload.username,
              roles: roles
            };
            
            console.log('Auth initialized with user:', userData);
            setUser(userData);
            setIsAuthenticated(true);
          }
        } else {
          console.log('No valid token found');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('JWT parsing error:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
        // 토큰이 잘못된 경우 제거
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // 빈 배열로 한 번만 실행

  const login = (userData, token) => {
    try {
      console.log('AuthContext login called with:', { userData, token });
      console.log('Token type:', typeof token);
      console.log('Token length:', token ? token.length : 0);
      
      if (!token || typeof token !== 'string' || token.length < 50) {
        throw new Error('Invalid token provided to login function');
      }
      
      // 토큰을 localStorage에 저장
      localStorage.setItem('token', token);
      console.log('Token saved to localStorage');
      
      // 저장된 토큰 확인
      const savedToken = localStorage.getItem('token');
      console.log('Saved token length:', savedToken ? savedToken.length : 0);
      
      // 로그인 응답에서 직접 role 정보 사용
      const roles = Array.isArray(userData.roles)
        ? userData.roles
        : userData.role // 단일 role 필드
        ? [userData.role]
        : userData.roles
        ? String(userData.roles).split(',')
        : ['ROLE_USER']; // 기본값
      
      const user = {
        username: userData.username,
        roles: roles
      };
      
      console.log('Login successful with user:', user);
      console.log('User roles:', roles);
      console.log('Is admin?', roles.includes('ROLE_ADMIN'));
      
      setUser(user);
      setIsAuthenticated(true);

      // 역할에 따른 리다이렉트 (정확한 조건 확인)
      if (roles.includes('ROLE_ADMIN')) {
        console.log('Redirecting to admin dashboard');
        navigate('/admin', { replace: true });
      } else {
        console.log('Redirecting to user mypage');
        navigate('/mypage', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      throw error; // 에러를 다시 던져서 LoginForm에서 처리할 수 있도록
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/overview', { replace: true });
  };

  // useMemo로 value 객체 메모이제이션 (무한 리렌더링 방지)
  const value = useMemo(() => ({
    isAuthenticated,
    user,
    isLoading,
    login,
    logout
  }), [isAuthenticated, user, isLoading]);

  // 로딩 중일 때 로딩 컴포넌트 표시
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        인증 정보를 확인하는 중...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
