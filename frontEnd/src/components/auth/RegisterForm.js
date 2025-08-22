import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle, AlertCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { register, checkDuplicate } from '../../api/auth'; // API 함수 import

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
  gap: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 3rem 0.75rem 2.5rem;
  border-radius: 1rem;
  border: 1px solid ${({ hasError, isValid }) => {
    if (hasError) return '#fca5a5';
    if (isValid) return '#34d399';
    return '#d1d5db';
  }};
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

const CheckButton = styled.button`
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  transition: all 0.2s;
  
  ${({ isChecking, isValid, hasError }) => {
    if (isChecking) {
      return `
        background: #e5e7eb;
        color: #6b7280;
        cursor: not-allowed;
      `;
    }
    if (isValid) {
      return `
        background: #dcfce7;
        color: #16a34a;
        border: 1px solid #34d399;
      `;
    }
    if (hasError) {
      return `
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fca5a5;
      `;
    }
    return `
      background: #6366f1;
      color: white;
      &:hover {
        background: #4f46e5;
      }
    `;
  }}
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ErrorText = styled.p`
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #b91c1c;
`;

const SuccessText = styled.p`
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #16a34a;
  display: flex;
  align-items: center;
  gap: 0.25rem;
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

const SmallSpinner = styled.div`
  border: 2px solid currentColor;
  border-bottom: 2px solid transparent;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
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
  
  // 중복 확인 상태
  const [duplicateCheck, setDuplicateCheck] = useState({
    username: { checked: false, available: false, checking: false },
    nickname: { checked: false, available: false, checking: false },
    email: { checked: false, available: false, checking: false }
  });
  
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
    
    // 값이 변경되면 중복 확인 상태 초기화
    if (['username', 'nickname', 'email'].includes(name)) {
      setDuplicateCheck(prev => ({
        ...prev,
        [name]: { checked: false, available: false, checking: false }
      }));
    }
  };

  // 중복 확인 함수
  const handleDuplicateCheck = async (field) => {
    const value = formData[field];
    
    if (!value) {
      setErrors(prev => ({ ...prev, [field]: '값을 입력해주세요' }));
      return;
    }
    
    // 기본 유효성 검사
    if (field === 'username' && value.length < 4) {
      setErrors(prev => ({ ...prev, [field]: '사용자 이름은 4자 이상이어야 합니다' }));
      return;
    }
    
    if (field === 'nickname' && value.length < 2) {
      setErrors(prev => ({ ...prev, [field]: '닉네임은 2자 이상이어야 합니다' }));
      return;
    }
    
    if (field === 'email' && !/\S+@\S+\.\S+/.test(value)) {
      setErrors(prev => ({ ...prev, [field]: '올바른 이메일 형식이 아닙니다' }));
      return;
    }
    
    // 중복 확인 시작
    setDuplicateCheck(prev => ({
      ...prev,
      [field]: { ...prev[field], checking: true }
    }));
    
    setErrors(prev => ({ ...prev, [field]: '' }));
    
    try {
      const result = await checkDuplicate(field, value);
      
      setDuplicateCheck(prev => ({
        ...prev,
        [field]: { 
          checked: true, 
          available: result.available, 
          checking: false 
        }
      }));
      
      if (!result.available) {
        setErrors(prev => ({ 
          ...prev, 
          [field]: result.message || `이미 사용중인 ${field === 'username' ? '사용자명' : field === 'nickname' ? '닉네임' : '이메일'}입니다` 
        }));
      }
      
    } catch (error) {
      console.error('중복 확인 오류:', error);
      setDuplicateCheck(prev => ({
        ...prev,
        [field]: { checked: false, available: false, checking: false }
      }));
      setErrors(prev => ({ 
        ...prev, 
        [field]: '중복 확인 중 오류가 발생했습니다' 
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = '사용자 이름을 입력해주세요';
    } else if (formData.username.length < 4) {
      newErrors.username = '사용자 이름은 4자 이상이어야 합니다';
    } else if (!duplicateCheck.username.checked || !duplicateCheck.username.available) {
      newErrors.username = '사용자 이름 중복 확인을 완료해주세요';
    }
    
    if (!formData.nickname) {
      newErrors.nickname = '닉네임을 입력해주세요';
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상이어야 합니다';
    } else if (!duplicateCheck.nickname.checked || !duplicateCheck.nickname.available) {
      newErrors.nickname = '닉네임 중복 확인을 완료해주세요';
    }
    
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    } else if (!duplicateCheck.email.checked || !duplicateCheck.email.available) {
      newErrors.email = '이메일 중복 확인을 완료해주세요';
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
                isValid={duplicateCheck.username.checked && duplicateCheck.username.available}
                disabled={isLoading}
              />
              <CheckButton
                type="button"
                onClick={() => handleDuplicateCheck('username')}
                disabled={isLoading || duplicateCheck.username.checking || !formData.username}
                isChecking={duplicateCheck.username.checking}
                isValid={duplicateCheck.username.checked && duplicateCheck.username.available}
                hasError={duplicateCheck.username.checked && !duplicateCheck.username.available}
              >
                {duplicateCheck.username.checking ? (
                  <SmallSpinner />
                ) : duplicateCheck.username.checked && duplicateCheck.username.available ? (
                  <>
                    <Check size={14} />
                    사용가능
                  </>
                ) : duplicateCheck.username.checked && !duplicateCheck.username.available ? (
                  <>
                    <AlertCircle size={14} />
                    중복
                  </>
                ) : (
                  '중복확인'
                )}
              </CheckButton>
            </InputWrapper>
            {errors.username && <ErrorText>{errors.username}</ErrorText>}
            {duplicateCheck.username.checked && duplicateCheck.username.available && (
              <SuccessText>
                <Check size={14} />
                사용 가능한 아이디입니다
              </SuccessText>
            )}
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
                isValid={duplicateCheck.nickname.checked && duplicateCheck.nickname.available}
                disabled={isLoading}
              />
              <CheckButton
                type="button"
                onClick={() => handleDuplicateCheck('nickname')}
                disabled={isLoading || duplicateCheck.nickname.checking || !formData.nickname}
                isChecking={duplicateCheck.nickname.checking}
                isValid={duplicateCheck.nickname.checked && duplicateCheck.nickname.available}
                hasError={duplicateCheck.nickname.checked && !duplicateCheck.nickname.available}
              >
                {duplicateCheck.nickname.checking ? (
                  <SmallSpinner />
                ) : duplicateCheck.nickname.checked && duplicateCheck.nickname.available ? (
                  <>
                    <Check size={14} />
                    사용가능
                  </>
                ) : duplicateCheck.nickname.checked && !duplicateCheck.nickname.available ? (
                  <>
                    <AlertCircle size={14} />
                    중복
                  </>
                ) : (
                  '중복확인'
                )}
              </CheckButton>
            </InputWrapper>
            {errors.nickname && <ErrorText>{errors.nickname}</ErrorText>}
            {duplicateCheck.nickname.checked && duplicateCheck.nickname.available && (
              <SuccessText>
                <Check size={14} />
                사용 가능한 닉네임입니다
              </SuccessText>
            )}
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
                isValid={duplicateCheck.email.checked && duplicateCheck.email.available}
                disabled={isLoading}
              />
              <CheckButton
                type="button"
                onClick={() => handleDuplicateCheck('email')}
                disabled={isLoading || duplicateCheck.email.checking || !formData.email}
                isChecking={duplicateCheck.email.checking}
                isValid={duplicateCheck.email.checked && duplicateCheck.email.available}
                hasError={duplicateCheck.email.checked && !duplicateCheck.email.available}
              >
                {duplicateCheck.email.checking ? (
                  <SmallSpinner />
                ) : duplicateCheck.email.checked && duplicateCheck.email.available ? (
                  <>
                    <Check size={14} />
                    사용가능
                  </>
                ) : duplicateCheck.email.checked && !duplicateCheck.email.available ? (
                  <>
                    <AlertCircle size={14} />
                    중복
                  </>
                ) : (
                  '중복확인'
                )}
              </CheckButton>
            </InputWrapper>
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
            {duplicateCheck.email.checked && duplicateCheck.email.available && (
              <SuccessText>
                <Check size={14} />
                사용 가능한 이메일입니다
              </SuccessText>
            )}
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