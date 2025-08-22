// src/components/LoginForm.js (수정된 버전)
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { User, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // AuthContext 사용
import { login } from '../../api/auth'; // API 함수 import

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

const LoginForm = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [role, setRole] = useState('USER');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login: contextLogin } = useAuth(); // AuthContext의 login 함수

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // 입력 시 에러 메시지 제거
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

            console.log('로그인 성공:', result);
            console.log('받은 토큰:', result.token);
            console.log('받은 역할:', result.role);
            console.log('선택한 역할:', role);

            // 토큰 유효성 검사
            if (!result.token || typeof result.token !== 'string' || result.token.length < 50) {
                throw new Error('유효하지 않은 토큰을 받았습니다.');
            }

            // 역할 기반 검증 (LoginForm에서만)
            if (result.role === 'ROLE_ADMIN') {
                if (role !== 'ADMIN') {
                    setError('관리자 계정은 관리자 버튼으로 로그인해야 합니다.');
                    setIsLoading(false);
                    return;
                }
            } else {
                if (role === 'ADMIN') {
                    setError('일반 사용자는 관리자로 로그인할 수 없습니다.');
                    setIsLoading(false);
                    return;
                }
            }

            // AuthContext에 로그인 정보 전달 (리다이렉트는 AuthContext에서 처리)
            contextLogin(result, result.token);

        } catch (err) {
            console.error('로그인 오류:', err);

            // 에러 메시지 처리
            if (typeof err === 'string') {
                setError(err);
            } else if (err.error) {
                setError(err.error);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <Header>
                <HeaderIcon><LogIn size={32} color="white" /></HeaderIcon>
                <Title>로그인</Title>
                <Subtitle>축제 정보와 커뮤니티를 즐겨보세요</Subtitle>
            </Header>

            {error && <ErrorBox>{error}</ErrorBox>}

            {/* 역할 선택 */}
            <RoleContainer>
                <SecondaryButton
                    type="button"
                    onClick={() => {
                        setRole('USER');
                        setFormData({ username: 'test', password: 'test123!' }); // ✅ 자동 입력
                    }}
                    disabled={isLoading}
                    style={{
                        borderColor: role === 'USER' ? '#6366f1' : '#d1d5db',
                        color: role === 'USER' ? '#6366f1' : '#374151'
                    }}
                >
                    일반 회원
                </SecondaryButton>
                <SecondaryButton
                    type="button"
                    onClick={() => {
                        setRole('ADMIN');
                        setFormData({ username: 'admin', password: 'admin123!' }); // ✅ 자동 입력
                    }}
                    disabled={isLoading}
                    style={{
                        borderColor: role === 'ADMIN' ? '#6366f1' : '#d1d5db',
                        color: role === 'ADMIN' ? '#6366f1' : '#374151'
                    }}
                >
                    관리자
                </SecondaryButton>
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