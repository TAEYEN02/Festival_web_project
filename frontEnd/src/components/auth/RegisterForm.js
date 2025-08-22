import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/auth'; // API 함수 import

// 기존 스타일 컴포넌트들 유지...
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
`;

const Container = styled.div`
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const HeaderIcon = styled.div`
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem auto;
  background: linear-gradient(to right, #34d399, #3b82f6);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 2.5rem;
  border-radius: 1rem;
  border: 1px solid ${({ hasError }) => (hasError ? '#fca5a5' : '#d1d5db')};
  outline: none;
  background: rgba(255,255,255,0.5);
  transition: all 0.2s;
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
  }
  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const IconLeft = styled.div`
  position: absolute;
  inset-y: 0;
  left: 0.75rem;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: #9ca3af;
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  inset-y: 0;
  right: 0.75rem;
  display: flex;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  &:hover {
    color: #4b5563;
  }
  &:disabled {
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #b91c1c;
`;

const SubmitButton = styled.button`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 1rem;
  font-weight: 500;
  color: white;
  background: ${({ disabled }) => (disabled ? '#9ca3af' : 'linear-gradient(to right, #34d399, #3b82f6)')};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  border: none;
  transition: all 0.2s;
  &:hover {
    ${({ disabled }) => !disabled && 'box-shadow: 0 5px 15px rgba(56,189,248,0.3); transform: translateY(-2px);'}
  }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  border: 2px solid white;
  border-bottom: 2px solid transparent;
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  animation: ${spin} 1s linear infinite;
`;

const SwitchButton = styled.button`
  font-size: 0.875rem;
  color: #6366f1;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ErrorBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #b91c1c;
  font-size: 0.875rem;
`;

const SuccessBox = styled.div`
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #15803d;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RegisterForm = () => {
  const [formData, setFormData] = useState({ 
    username: '', 
    nickname: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSwitchToLogin = () => {
    navigate("/login", { replace: true });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 입력 시 해당 필드의 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = '사용자 이름을 입력해주세요';
    } else if (formData.username.length < 4) {
      newErrors.username = '사용자 이름은 4자 이상이어야 합니다';
    }
    
    if (!formData.nickname) {
      newErrors.nickname = '닉네임을 입력해주세요';
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상이어야 합니다';
    }
    
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }
    
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }
    
    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      await register(
        formData.username,
        formData.nickname,
        formData.email,
        formData.password
      );
      
      setIsSuccess(true);
      
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
      
    } catch (err) {
      console.error('회원가입 오류:', err);
      
      // 에러 메시지 처리
      if (typeof err === 'string') {
        setErrors({ general: err });
      } else if (err.error) {
        setErrors({ general: err.error });
      } else {
        setErrors({ general: '회원가입에 실패했습니다. 다시 시도해주세요.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <PageContainer>
        <Container>
          <Header>
            <HeaderIcon><CheckCircle size={32} color="white" /></HeaderIcon>
            <Title>회원가입 완료!</Title>
            <Subtitle>로그인 페이지로 이동합니다...</Subtitle>
          </Header>
          
          <SuccessBox>
            <CheckCircle size={20} />
            회원가입이 성공적으로 완료되었습니다.
          </SuccessBox>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <Header>
          <HeaderIcon><UserPlus size={32} color="white" /></HeaderIcon>
          <Title>회원가입</Title>
          <Subtitle>새로운 계정을 만들어 시작하세요</Subtitle>
        </Header>

        {errors.general && <ErrorBox>{errors.general}</ErrorBox>}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>아이디</Label>
            <InputWrapper>
              <IconLeft><User size={20} /></IconLeft>
              <Input 
                type="text" 
                name="username" 
                value={formData.username} 
                onChange={handleChange} 
                placeholder="사용자 이름 (4자 이상)"
                hasError={!!errors.username}
                disabled={isLoading}
              />
            </InputWrapper>
            {errors.username && <ErrorText>{errors.username}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>닉네임</Label>
            <InputWrapper>
              <IconLeft><User size={20} /></IconLeft>
              <Input 
                type="text" 
                name="nickname" 
                value={formData.nickname} 
                onChange={handleChange} 
                placeholder="닉네임 (2자 이상)"
                hasError={!!errors.nickname}
                disabled={isLoading}
              />
            </InputWrapper>
            {errors.nickname && <ErrorText>{errors.nickname}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>이메일 주소</Label>
            <InputWrapper>
              <IconLeft><Mail size={20} /></IconLeft>
              <Input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="your@email.com"
                hasError={!!errors.email}
                disabled={isLoading}
              />
            </InputWrapper>
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>비밀번호</Label>
            <InputWrapper>
              <IconLeft><Lock size={20} /></IconLeft>
              <Input 
                type={showPassword ? 'text' : 'password'} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="••••••••"
                hasError={!!errors.password}
                disabled={isLoading}
              />
              <TogglePasswordButton 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </TogglePasswordButton>
            </InputWrapper>
            {errors.password && <ErrorText>{errors.password}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>비밀번호 확인</Label>
            <InputWrapper>
              <IconLeft><Lock size={20} /></IconLeft>
              <Input 
                type={showConfirmPassword ? 'text' : 'password'} 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                placeholder="••••••••"
                hasError={!!errors.confirmPassword}
                disabled={isLoading}
              />
              <TogglePasswordButton 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </TogglePasswordButton>
            </InputWrapper>
            {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
          </FormGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? <Spinner /> : '회원가입'}
          </SubmitButton>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <SwitchButton 
              type="button" 
              onClick={handleSwitchToLogin}
              disabled={isLoading}
            >
              이미 계정이 있으신가요? 로그인
            </SwitchButton>
          </div>
        </Form>
      </Container>
    </PageContainer>
  );
};

export default RegisterForm;