// src/components/LoginForm.js (수정된 버전)
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { User, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login } from '../../api/auth';

// Styled components는 기존과 동일하므로 생략...
const Container = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  max-width: 400px;
  margin: 2rem auto;
`;

const Header = styled.div`
  text-align:center; 
  margin-bottom:2rem;
`;

const HeaderIcon = styled.div`
  width: 4rem; 
  height:4rem; 
  margin:0 auto 1rem auto;
  background: linear-gradient(to right,#6366f1,#a855f7);
  border-radius:9999px;
  display:flex; 
  align-items:center; 
  justify-content:center;
`;

const Title = styled.h2`
  font-size:1.5rem; 
  font-weight:bold; 
  color:#1f2937; 
  margin-bottom:0.5rem;
`;

const Subtitle = styled.p`
  color:#6b7280; 
  font-size:0.875rem;
`;

const ErrorBox = styled.div`
  background:#fef2f2; 
  border:1px solid #fca5a5; 
  border-radius:0.75rem;
  padding:1rem; 
  margin-bottom:1rem; 
  color:#b91c1c; 
  font-size:0.875rem;
`;

const Form = styled.form`
  display:flex; 
  flex-direction:column;
  gap:1rem;
`;

const InputWrapper = styled.div`
  position:relative; 
`;

const Input = styled.input`
  width:78%; 
  padding:0.75rem 3rem 0.75rem 2.5rem;
  border-radius:1rem; 
  border:1px solid ${({ $hasError }) => $hasError ? '#fca5a5' : '#d1d5db'};
  outline:none; 
  transition:all 0.2s;
  &:focus{
    border-color:#6366f1; 
    box-shadow:0 0 0 2px rgba(99,102,241,0.2);
  }
  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const IconLeft = styled.div`
  position:absolute; 
  left:0.75rem; 
  top:50%; 
  transform:translateY(-50%);
  display:flex; 
  align-items:center; 
  pointer-events:none; 
  color:#9ca3af;
`;

const TogglePasswordButton = styled.button`
  position:absolute; 
  right:0.75rem; 
  top:50%; 
  transform:translateY(-50%);
  background:transparent; 
  border:none; 
  cursor:pointer; 
  color:#9ca3af; 
  display:flex; 
  align-items:center;
  &:disabled {
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  width:100%; 
  display:flex; 
  justify-content:center; 
  align-items:center; 
  gap:0.5rem;
  padding:0.75rem; 
  border-radius:1rem; 
  font-weight:500; 
  color:white;
  background: linear-gradient(to right,#6366f1,#a855f7); 
  border:none; 
  cursor:pointer;
  transition:all 0.2s;
  &:hover { 
    box-shadow:0 5px 15px rgba(99,102,241,0.3); 
    transform:translateY(-2px); 
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled.button`
  flex:1; 
  padding:0.5rem; 
  border-radius:1rem; 
  border:2px solid #d1d5db;
  font-weight:500; 
  color:#374151; 
  background:white; 
  cursor:pointer;
  transition:all 0.2s;
  &:hover { 
    background:#f9fafb; 
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RoleContainer = styled.div`
  display:flex;
  gap:1rem; 
  margin-bottom:1rem;
`;

const Divider = styled.div`
  text-align:center; 
  font-size:0.875rem; 
  color:#6b7280; 
  margin:1rem 0; 
  &::before{
    content:''; 
    display:block; 
    height:1px; 
    background:#d1d5db; 
    margin-bottom:0.5rem;
  }
`;

const spin = keyframes`
  0%{transform:rotate(0deg);} 
  100%{transform:rotate(360deg);}
`;

const Spinner = styled.div`
  border:2px solid white; 
  border-bottom:2px solid transparent; 
  border-radius:50%; 
  width:1.25rem; 
  height:1.25rem; 
  animation:${spin} 1s linear infinite;
`;

const SocialButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 1rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { opacity: 0.9; transform: translateY(-1px); }
  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`;

const GoogleButton = styled(SocialButton)`
  background: #4285f4;
  color: white;
`;

const KakaoButton = styled(SocialButton)`
  background: #fee500;
  color: #3c1e1e;
`;

const FindLinksContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
  font-size: 0.875rem;
`;

const FindLink = styled.button`
  background: transparent;
  border: none;
  color: #6366f1;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.875rem;
  padding: 0;
  
  &:hover {
    color: #4f46e5;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const Separator = styled.span`
  color: #d1d5db;
`;

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [role, setRole] = useState('USER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState({ kakao: false, google: false });
  const [sdkLoading, setSdkLoading] = useState({ kakao: true, google: true });
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();

  useEffect(() => {
    console.log('Environment variables check:');
    console.log('API URL:', process.env.REACT_APP_API_URL);
    console.log('Kakao Key:', process.env.REACT_APP_KAKAO_JS_KEY);
    console.log('Google Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);

    const loadKakaoSDK = async () => {
      try {
        setSdkLoading(prev => ({ ...prev, kakao: true }));
        
        if (window.Kakao && window.Kakao.isInitialized()) {
          console.log('Kakao SDK already loaded and initialized');
          setSdkLoaded(prev => ({ ...prev, kakao: true }));
          setSdkLoading(prev => ({ ...prev, kakao: false }));
          return;
        }

        if (!process.env.REACT_APP_KAKAO_JS_KEY) {
          throw new Error('Kakao JS Key not found in environment variables');
        }

        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
          script.onload = () => {
            try {
              if (window.Kakao && !window.Kakao.isInitialized()) {
                window.Kakao.init(process.env.REACT_APP_KAKAO_JS_KEY);
                console.log('Kakao SDK loaded and initialized successfully');
              }
              setSdkLoaded(prev => ({ ...prev, kakao: true }));
              resolve();
            } catch (error) {
              console.error('Kakao SDK initialization failed:', error);
              reject(error);
            } finally {
              setSdkLoading(prev => ({ ...prev, kakao: false }));
            }
          };
          script.onerror = () => {
            const error = new Error('Failed to load Kakao SDK script');
            console.error(error);
            setSdkLoading(prev => ({ ...prev, kakao: false }));
            reject(error);
          };
          document.head.appendChild(script);
        });
      } catch (error) {
        console.error('Kakao SDK loading error:', error);
        setSdkLoading(prev => ({ ...prev, kakao: false }));
        throw error;
      }
    };

    const loadGoogleSDK = async () => {
      try {
        setSdkLoading(prev => ({ ...prev, google: true }));
        
        if (window.google && window.google.accounts) {
          console.log('Google Identity Services already loaded');
          setSdkLoaded(prev => ({ ...prev, google: true }));
          setSdkLoading(prev => ({ ...prev, google: false }));
          return;
        }

        if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
          throw new Error('Google Client ID not found in environment variables');
        }

        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = () => {
            try {
              if (window.google && window.google.accounts) {
                console.log('Google Identity Services loaded successfully');
                setSdkLoaded(prev => ({ ...prev, google: true }));
                resolve();
              } else {
                throw new Error('Google Identity Services not available');
              }
            } catch (error) {
              console.error('Google Identity Services initialization failed:', error);
              reject(error);
            } finally {
              setSdkLoading(prev => ({ ...prev, google: false }));
            }
          };
          script.onerror = () => {
            const error = new Error('Failed to load Google Identity Services script');
            console.error(error);
            setSdkLoading(prev => ({ ...prev, google: false }));
            reject(error);
          };
          document.head.appendChild(script);
        });
      } catch (error) {
        console.error('Google SDK loading error:', error);
        setSdkLoading(prev => ({ ...prev, google: false }));
        throw error;
      }
    };

    // SDK 로드 실행
    const initializeSDKs = async () => {
      const results = await Promise.allSettled([loadKakaoSDK(), loadGoogleSDK()]);
      
      results.forEach((result, index) => {
        const sdkName = index === 0 ? 'Kakao' : 'Google';
        if (result.status === 'rejected') {
          console.error(`${sdkName} SDK loading failed:`, result.reason);
          setError(`${sdkName} SDK 로딩에 실패했습니다. 새로고침 후 다시 시도해주세요.`);
        } else {
          console.log(`${sdkName} SDK loaded successfully`);
        }
      });
    };

    initializeSDKs();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);

      if (!result.token || typeof result.token !== 'string' || result.token.length < 50) {
        throw new Error('유효하지 않은 토큰을 받았습니다.');
      }

      if (result.role === 'ROLE_ADMIN' && role !== 'ADMIN') {
        setError('관리자 계정은 관리자 버튼으로 로그인해야 합니다.');
        setIsLoading(false);
        return;
      }
      if (result.role !== 'ROLE_ADMIN' && role === 'ADMIN') {
        setError('일반 사용자는 관리자로 로그인할 수 없습니다.');
        setIsLoading(false);
        return;
      }

      contextLogin(result, result.token);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || '로그인에 실패했습니다.');
    } finally { 
      setIsLoading(false); 
    }
  };

  // Kakao 로그인 (디버깅 정보 추가)
  const handleKakaoLogin = async () => {
    console.log('=== Kakao 로그인 시작 ===');
    console.log('현재 사용 중인 Kakao JS Key:', process.env.REACT_APP_KAKAO_JS_KEY);
    console.log('Kakao SDK 상태:', window.Kakao ? '로드됨' : '로드 안됨');
    console.log('Kakao 초기화 상태:', window.Kakao?.isInitialized() ? '초기화됨' : '초기화 안됨');
    
    if (!process.env.REACT_APP_KAKAO_JS_KEY) {
      setError('Kakao 로그인을 위한 환경변수가 설정되지 않았습니다.');
      return;
    }

    if (!sdkLoaded.kakao || !window.Kakao) {
      setError('카카오 SDK가 아직 로드되지 않았습니다. 페이지를 새로고침해주세요.');
      return;
    }

    // 먼저 백엔드 서버 연결 테스트
    try {
      console.log('백엔드 서버 연결 테스트 중...');
      const testResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/signin`, {
        method: 'OPTIONS',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('서버 연결 테스트 결과:', testResponse.status);
    } catch (err) {
      console.error('서버 연결 실패:', err);
      setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Kakao.Auth.login 호출 (닉네임만 요청)');
      console.log('요청 스코프:', 'profile_nickname');
      
      window.Kakao.Auth.login({
        scope: 'profile_nickname', // 닉네임만 요청
        success: async (authObj) => {
          console.log('카카오 인증 성공:', authObj);
          try {
            console.log('백엔드로 토큰 전송 중...');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/oauth/kakao`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({ accessToken: authObj.access_token })
            });

            console.log('백엔드 응답 상태:', response.status);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('백엔드 오류 응답:', errorText);
              throw new Error(`서버 오류: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('백엔드 응답 데이터:', data);
            
            if (data.token) {
              console.log('로그인 성공, 리다이렉트 중...');
              contextLogin(data, data.token);
              navigate('/');
            } else {
              throw new Error('토큰을 받지 못했습니다.');
            }
          } catch (err) {
            console.error('카카오 로그인 API 호출 실패:', err);
            setError(`카카오 로그인 실패: ${err.message}`);
          }
        },
        fail: (err) => {
          console.error('카카오 로그인 실패 상세:', err);
          console.log('오류 코드:', err.error);
          console.log('오류 설명:', err.error_description);
          
          if (err.error === 'KOE006') {
            setError('카카오 앱 설정 오류입니다. 카카오 개발자 콘솔에서 다음을 확인해주세요:\n1. 플랫폼 도메인: http://localhost:3000\n2. 카카오 로그인 활성화\n3. Redirect URI 설정');
          } else {
            setError(`카카오 로그인에 실패했습니다: ${err.error_description || '알 수 없는 오류'}`);
          }
        }
      });
    } catch (err) {
      console.error('카카오 로그인 오류:', err);
      setError('카카오 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google 로그인 (임시로 비활성화)
  const handleGoogleLogin = async () => {
    setError('Google 로그인은 현재 개발 중입니다. Kakao 로그인을 사용해주세요.');
    
    // TODO: Google 로그인 구현
    // 개발 환경에서 Google OAuth는 복잡한 설정이 필요하므로
    // 일단 Kakao 로그인이 잘 작동하는지 확인 후 추후 구현
  };

  return (
    <Container>
      <Header>
        <HeaderIcon><LogIn size={32} color="white" /></HeaderIcon>
        <Title>로그인</Title>
        <Subtitle>축제 정보와 커뮤니티를 즐겨보세요</Subtitle>
      </Header>

      {error && <ErrorBox>{error}</ErrorBox>}

      {/* 디버깅용 - 나중에 제거할 수 있습니다 */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          marginBottom: '1rem', 
          padding: '0.5rem', 
          background: '#f8f9fa', 
          borderRadius: '0.5rem' 
        }}>
          <div>API URL: {process.env.REACT_APP_API_URL || '❌ 없음'}</div>
          <div>Kakao Key: {process.env.REACT_APP_KAKAO_JS_KEY ? '✅ 설정됨' : '❌ 없음'}</div>
          <div>Google Client ID: {process.env.REACT_APP_GOOGLE_CLIENT_ID ? '✅ 설정됨' : '❌ 없음'}</div>
          <div>Kakao SDK: {sdkLoading.kakao ? '🔄 로딩중' : sdkLoaded.kakao ? '✅ 로딩됨' : '❌ 실패'}</div>
          <div>Google SDK: {sdkLoading.google ? '🔄 로딩중' : sdkLoaded.google ? '✅ 로딩됨' : '❌ 실패'}</div>
        </div>
      )}

      <RoleContainer>
        <SecondaryButton
          type="button"
          onClick={() => { setRole('USER'); setFormData({ username: 'test', password: 'test123!' }); }}
          disabled={isLoading}
          style={{ borderColor: role === 'USER' ? '#6366f1' : '#d1d5db', color: role === 'USER' ? '#6366f1' : '#374151' }}
        >일반 회원</SecondaryButton>

        <SecondaryButton
          type="button"
          onClick={() => { setRole('ADMIN'); setFormData({ username: 'admin', password: 'admin123!' }); }}
          disabled={isLoading}
          style={{ borderColor: role === 'ADMIN' ? '#6366f1' : '#d1d5db', color: role === 'ADMIN' ? '#6366f1' : '#374151' }}
        >관리자</SecondaryButton>
      </RoleContainer>

      <Form onSubmit={handleSubmit}>
        <InputWrapper>
          <IconLeft><User size={20} /></IconLeft>
          <Input 
            type="text" 
            name="username" 
            value={formData.username} 
            onChange={handleChange} 
            placeholder={role === 'ADMIN' ? "관리자 아이디 (admin)" : "사용자 아이디"} 
            disabled={isLoading} 
          />
        </InputWrapper>

        <InputWrapper>
          <IconLeft><Lock size={20} /></IconLeft>
          <Input 
            type={showPassword ? 'text' : 'password'} 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            placeholder={role === 'ADMIN' ? "관리자 비밀번호 (admin123!)" : "비밀번호"} 
            disabled={isLoading} 
          />
          <TogglePasswordButton 
            type="button" 
            onClick={() => setShowPassword(prev => !prev)} 
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </TogglePasswordButton>
        </InputWrapper>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? <Spinner /> : <><LogIn size={20} /> 로그인</>}
        </SubmitButton>

        <FindLinksContainer>
          <FindLink 
            type="button" 
            onClick={() => navigate('/find-credentials')} 
            disabled={isLoading}
          >
            아이디 찾기
          </FindLink>
          <Separator>|</Separator>
          <FindLink 
            type="button" 
            onClick={() => navigate('/find-credentials')} 
            disabled={isLoading}
          >
            비밀번호 찾기
          </FindLink>
        </FindLinksContainer>

        <Divider>또는</Divider>

        <GoogleButton 
          type="button" 
          onClick={handleGoogleLogin} 
          disabled={isLoading || sdkLoading.google || !sdkLoaded.google}
          style={{ opacity: sdkLoaded.google ? 1 : 0.5 }}
        >
          {sdkLoading.google ? (
            <>
              <Spinner style={{ border: '2px solid #333', borderBottom: '2px solid transparent' }} />
              Google SDK 로딩 중...
            </>
          ) : !sdkLoaded.google ? (
            <>
              ⚠️ Google 로그인 준비 중 (새로고침 시도)
            </>
          ) : (
            <>
              🔵 Google 로그인
            </>
          )}
        </GoogleButton>

        <KakaoButton 
          type="button" 
          onClick={handleKakaoLogin} 
          disabled={isLoading || sdkLoading.kakao || !sdkLoaded.kakao}
        >
          {sdkLoading.kakao ? (
            <>
              <Spinner style={{ border: '2px solid #3c1e1e', borderBottom: '2px solid transparent' }} />
              Kakao SDK 로딩 중...
            </>
          ) : !sdkLoaded.kakao ? (
            <>
              ❌ Kakao SDK 로딩 실패
            </>
          ) : (
            <>
              💬 Kakao 로그인
            </>
          )}
        </KakaoButton>

        <Divider>또는</Divider>

        <SecondaryButton 
          type="button" 
          onClick={() => navigate('/register')} 
          disabled={isLoading}
        >
          <UserPlus size={20} /> 회원가입
        </SecondaryButton>
      </Form>
    </Container>
  );
};

export default LoginForm;