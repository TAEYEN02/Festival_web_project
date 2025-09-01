import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Mail, Search, Key, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { findUsername, resetPassword } from '../../api/auth';

// 기본 스타일 컴포넌트들
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
  background: ${({ type }) => 
    type === 'find-username' 
      ? 'linear-gradient(to right,#4a4aff)' 
      : 'linear-gradient(to right,#4a4aff)'
  };
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

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  background: #f3f4f6;
  border-radius: 0.75rem;
  padding: 0.25rem;
`;

const Tab = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ active }) => active ? 'white' : 'transparent'};
  color: ${({ active }) => active ? '#1f2937' : '#6b7280'};
  box-shadow: ${({ active }) => active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:hover {
    color: #1f2937;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
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
  background: ${({ disabled, variant }) => {
    if (disabled) return '#9ca3af';
    return variant === 'find-username' 
      ? 'linear-gradient(to right, #4a4aff)' 
      : 'linear-gradient(to right,#4a4aff)';
  }};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  border: none;
  transition: all 0.2s;
  &:hover {
    ${({ disabled }) => !disabled && 'box-shadow: 0 5px 15px rgba(56,189,248,0.3); transform: translateY(-2px);'}
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 1rem;
  font-weight: 500;
  color: #6b7280;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
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

const ErrorBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #b91c1c;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const ResultBox = styled.div`
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 1rem 0;
  text-align: center;
`;

const ResultTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const ResultContent = styled.p`
  font-size: 1rem;
  color: #4b5563;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px dashed #d1d5db;
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

const FindCredentialsForm = () => {
  const [activeTab, setActiveTab] = useState('find-username'); // 'find-username' | 'reset-password'
  const [formData, setFormData] = useState({
    email: '',
    username: '' // 비밀번호 재설정 시 사용
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData({ email: '', username: '' });
    setErrors({});
    setResult(null);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 입력 시 해당 필드의 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // 전체 에러 메시지도 제거
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }
    
    if (activeTab === 'reset-password' && !formData.username) {
      newErrors.username = '아이디를 입력해주세요';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setErrorMessage('');
    setSuccessMessage('');
    setResult(null);
    
    try {
      if (activeTab === 'find-username') {
        // 아이디 찾기
        const response = await findUsername(formData.email);
        setResult({
          type: 'username',
          data: response.username
        });
        setSuccessMessage('아이디를 찾았습니다!');
      } else {
        // 비밀번호 재설정
        const response = await resetPassword(formData.username, formData.email);
        setSuccessMessage(response.message || '임시 비밀번호가 이메일로 발송되었습니다.');
        setResult({
          type: 'password-reset',
          data: response
        });
      }
    } catch (error) {
      console.error(`${activeTab} error:`, error);
      setErrorMessage(error.error || error.message || '요청 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleTryAgain = () => {
    setFormData({ email: '', username: '' });
    setErrors({});
    setResult(null);
    setSuccessMessage('');
    setErrorMessage('');
  };

  return (
    <PageContainer>
      <Container>
        <Header>
          <HeaderIcon type={activeTab}>
            {activeTab === 'find-username' ? (
              <Search size={32} color="white" />
            ) : (
              <Key size={32} color="white" />
            )}
          </HeaderIcon>
          <Title>
            {activeTab === 'find-username' ? '아이디 찾기' : '비밀번호 재설정'}
          </Title>
          <Subtitle>
            {activeTab === 'find-username' 
              ? '등록된 이메일로 아이디를 찾아드립니다' 
              : '등록된 이메일로 임시 비밀번호를 발송해드립니다'
            }
          </Subtitle>
        </Header>

        <TabContainer>
          <Tab
            active={activeTab === 'find-username'}
            onClick={() => handleTabChange('find-username')}
            disabled={isLoading}
          >
            아이디 찾기
          </Tab>
          <Tab
            active={activeTab === 'reset-password'}
            onClick={() => handleTabChange('reset-password')}
            disabled={isLoading}
          >
            비밀번호 재설정
          </Tab>
        </TabContainer>

        {errorMessage && (
          <ErrorBox>
            <AlertCircle size={20} />
            {errorMessage}
          </ErrorBox>
        )}

        {successMessage && (
          <SuccessBox>
            <CheckCircle size={20} />
            {successMessage}
          </SuccessBox>
        )}

        {result ? (
          <div>
            {result.type === 'username' && (
              <ResultBox>
                <ResultTitle>찾으신 아이디</ResultTitle>
                <ResultContent>{result.data}</ResultContent>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' }}>
                  이 아이디로 로그인하시거나, 비밀번호를 잊으셨다면 비밀번호 재설정을 이용해주세요.
                </p>
              </ResultBox>
            )}
            
            {result.type === 'password-reset' && (
              <ResultBox>
                <ResultTitle>임시 비밀번호 발송 완료</ResultTitle>
                <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.5' }}>
                  입력하신 이메일 주소로 임시 비밀번호를 발송했습니다.<br/>
                  이메일을 확인하신 후 임시 비밀번호로 로그인해주세요.<br/>
                  <strong>로그인 후 반드시 비밀번호를 변경해주세요.</strong>
                </p>
              </ResultBox>
            )}
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <SubmitButton
                type="button"
                onClick={handleTryAgain}
                variant={activeTab}
                style={{ flex: 1 }}
              >
                다시 찾기
              </SubmitButton>
              <SubmitButton
                type="button"
                onClick={handleBackToLogin}
                variant="secondary"
                style={{ 
                  flex: 1, 
                  background: '#6366f1',
                  backgroundImage: 'linear-gradient(to right, #6366f1, #8b5cf6)'
                }}
              >
                로그인하기
              </SubmitButton>
            </div>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {activeTab === 'reset-password' && (
              <FormGroup>
                <Label>아이디</Label>
                <InputWrapper>
                  <IconLeft><Search size={20} /></IconLeft>
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="아이디를 입력해주세요"
                    hasError={!!errors.username}
                    disabled={isLoading}
                  />
                </InputWrapper>
                {errors.username && <ErrorText>{errors.username}</ErrorText>}
              </FormGroup>
            )}

            <FormGroup>
              <Label>이메일 주소</Label>
              <InputWrapper>
                <IconLeft><Mail size={20} /></IconLeft>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="등록된 이메일을 입력해주세요"
                  hasError={!!errors.email}
                  disabled={isLoading}
                />
              </InputWrapper>
              {errors.email && <ErrorText>{errors.email}</ErrorText>}
            </FormGroup>

            <SubmitButton 
              type="submit" 
              disabled={isLoading}
              variant={activeTab}
            >
              {isLoading ? (
                <Spinner />
              ) : (
                <>
                  {activeTab === 'find-username' ? (
                    <>
                      <Search size={20} />
                      아이디 찾기
                    </>
                  ) : (
                    <>
                      <Key size={20} />
                      임시 비밀번호 발송
                    </>
                  )}
                </>
              )}
            </SubmitButton>

            <BackButton
              type="button"
              onClick={handleBackToLogin}
              disabled={isLoading}
            >
              <ArrowLeft size={20} />
              로그인 페이지로 돌아가기
            </BackButton>
          </Form>
        )}
      </Container>
    </PageContainer>
  );
};

export default FindCredentialsForm;