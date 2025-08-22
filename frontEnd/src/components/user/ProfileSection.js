import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Mail, Edit3, Save, X, Calendar, Lock, Eye, EyeOff, Key } from 'lucide-react';
import { updateUserInfo, changePassword } from '../../api/user';

const Container = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SectionDivider = styled.div`
  border-bottom: 1px solid #e5e7eb;
  margin: 2rem 0;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProfileGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoValue = styled.div`
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  color: #1f2937;
  border: 1px solid #e5e7eb;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  padding-right: ${({ hasIcon }) => hasIcon ? '2.5rem' : '0.75rem'};
  border-radius: 0.5rem;
  border: 1px solid ${({ hasError }) => hasError ? '#fca5a5' : '#d1d5db'};
  outline: none;
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

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #6b7280;
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  
  ${({ variant }) => {
    switch (variant) {
      case 'primary':
        return `
          background: linear-gradient(to right, #6366f1, #a855f7);
          color: white;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(99,102,241,0.3);
          }
        `;
      case 'secondary':
        return `
          background: #f3f4f6;
          color: #374151;
          &:hover {
            background: #e5e7eb;
          }
        `;
      case 'danger':
        return `
          background: linear-gradient(to right, #ef4444, #dc2626);
          color: white;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(239,68,68,0.3);
          }
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0.75rem;
  color: white;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  margin-top: 0.25rem;
  opacity: 0.9;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: #b91c1c;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: #15803d;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const PasswordStrengthIndicator = styled.div`
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: ${({ strength }) => {
    switch (strength) {
      case 'weak': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'strong': return '#10b981';
      default: return '#6b7280';
    }
  }};
`;

const ProfileSection = ({ userData, onUpdateUser }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [profileFormData, setProfileFormData] = useState({
    nickname: userData?.nickname || '',
    email: userData?.email || ''
  });
  
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!userData) return null;

  // 비밀번호 강도 체크
  const checkPasswordStrength = (password) => {
    if (password.length < 6) return 'weak';
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 'strong';
    return 'medium';
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 'weak': return '약함 - 6자 이상 입력하세요';
      case 'medium': return '보통 - 대소문자와 숫자를 포함하면 더 안전합니다';
      case 'strong': return '강함 - 안전한 비밀번호입니다';
      default: return '';
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handlePasswordChange = (field, value) => {
    setPasswordFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setProfileFormData({
      nickname: userData.nickname || '',
      email: userData.email || ''
    });
    setError('');
    setSuccess('');
  };

  const handleCancelProfileEdit = () => {
    setIsEditingProfile(false);
    setProfileFormData({
      nickname: userData.nickname || '',
      email: userData.email || ''
    });
    setError('');
    setSuccess('');
  };

  const handleSaveProfile = async () => {
    if (!profileFormData.nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (!profileFormData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileFormData.email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updatedUser = await updateUserInfo(profileFormData);
      onUpdateUser(updatedUser);
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      setIsEditingProfile(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('프로필 업데이트 실패:', err);
      if (typeof err === 'string') {
        setError(err);
      } else if (err.error) {
        setError(err.error);
      } else {
        setError('프로필 업데이트에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    setIsChangingPassword(true);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  const handleSavePassword = async () => {
    if (!passwordFormData.currentPassword) {
      setError('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (!passwordFormData.newPassword) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }

    if (passwordFormData.newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordFormData.currentPassword === passwordFormData.newPassword) {
      setError('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await changePassword({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword
      });
      
      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setIsChangingPassword(false);
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('비밀번호 변경 실패:', err);
      if (typeof err === 'string') {
        setError(err);
      } else if (err.error) {
        setError(err.error);
      } else {
        setError('비밀번호 변경에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container>
      <Title>
        <User size={24} />
        프로필 관리
      </Title>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      {/* 기본 정보 섹션 */}
      <SectionTitle>
        <User size={20} />
        기본 정보
      </SectionTitle>

      <ProfileGrid>
        <InfoGroup>
          <Label>
            <User size={16} />
            사용자 아이디
          </Label>
          <InfoValue>{userData.username}</InfoValue>
        </InfoGroup>

        <InfoGroup>
          <Label>
            <User size={16} />
            닉네임
          </Label>
          {isEditingProfile ? (
            <Input
              type="text"
              value={profileFormData.nickname}
              onChange={(e) => handleProfileChange('nickname', e.target.value)}
              placeholder="닉네임을 입력하세요"
              disabled={loading}
            />
          ) : (
            <InfoValue>{userData.nickname}</InfoValue>
          )}
        </InfoGroup>

        <InfoGroup>
          <Label>
            <Mail size={16} />
            이메일
          </Label>
          {isEditingProfile ? (
            <Input
              type="email"
              value={profileFormData.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              placeholder="이메일을 입력하세요"
              disabled={loading}
            />
          ) : (
            <InfoValue>{userData.email}</InfoValue>
          )}
        </InfoGroup>

        <InfoGroup>
          <Label>
            <Calendar size={16} />
            가입일
          </Label>
          <InfoValue>{formatDate(userData.createdAt)}</InfoValue>
        </InfoGroup>
      </ProfileGrid>

      <ButtonGroup>
        {isEditingProfile ? (
          <>
            <Button variant="secondary" onClick={handleCancelProfileEdit} disabled={loading}>
              <X size={16} />
              취소
            </Button>
            <Button variant="primary" onClick={handleSaveProfile} disabled={loading}>
              <Save size={16} />
              {loading ? '저장 중...' : '저장'}
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={handleEditProfile}>
            <Edit3 size={16} />
            프로필 수정
          </Button>
        )}
      </ButtonGroup>

      <SectionDivider />

      {/* 비밀번호 변경 섹션 */}
      <SectionTitle>
        <Lock size={20} />
        비밀번호 변경
      </SectionTitle>

      {isChangingPassword ? (
        <ProfileGrid>
          <InfoGroup>
            <Label>
              <Lock size={16} />
              현재 비밀번호
            </Label>
            <InputWrapper>
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordFormData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
                disabled={loading}
                hasIcon={true}
              />
              <PasswordToggle 
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                disabled={loading}
              >
                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </PasswordToggle>
            </InputWrapper>
          </InfoGroup>

          <InfoGroup>
            <Label>
              <Key size={16} />
              새 비밀번호
            </Label>
            <InputWrapper>
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordFormData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                disabled={loading}
                hasIcon={true}
              />
              <PasswordToggle 
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                disabled={loading}
              >
                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </PasswordToggle>
            </InputWrapper>
            {passwordFormData.newPassword && (
              <PasswordStrengthIndicator strength={checkPasswordStrength(passwordFormData.newPassword)}>
                {getPasswordStrengthText(checkPasswordStrength(passwordFormData.newPassword))}
              </PasswordStrengthIndicator>
            )}
          </InfoGroup>

          <InfoGroup>
            <Label>
              <Key size={16} />
              새 비밀번호 확인
            </Label>
            <InputWrapper>
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordFormData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
                disabled={loading}
                hasIcon={true}
                hasError={passwordFormData.confirmPassword && passwordFormData.newPassword !== passwordFormData.confirmPassword}
              />
              <PasswordToggle 
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={loading}
              >
                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </PasswordToggle>
            </InputWrapper>
            {passwordFormData.confirmPassword && passwordFormData.newPassword !== passwordFormData.confirmPassword && (
              <PasswordStrengthIndicator strength="weak">
                비밀번호가 일치하지 않습니다
              </PasswordStrengthIndicator>
            )}
          </InfoGroup>
        </ProfileGrid>
      ) : (
        <InfoGroup>
          <Label>
            <Lock size={16} />
            비밀번호
          </Label>
          <InfoValue>••••••••••</InfoValue>
        </InfoGroup>
      )}

      <ButtonGroup>
        {isChangingPassword ? (
          <>
            <Button variant="secondary" onClick={handleCancelPasswordChange} disabled={loading}>
              <X size={16} />
              취소
            </Button>
            <Button variant="danger" onClick={handleSavePassword} disabled={loading}>
              <Save size={16} />
              {loading ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </>
        ) : (
          <Button variant="danger" onClick={handleChangePassword}>
            <Lock size={16} />
            비밀번호 변경
          </Button>
        )}
      </ButtonGroup>

      <StatsGrid>
        <StatCard>
          <StatValue>{userData.roles?.length || 0}</StatValue>
          <StatLabel>역할 수</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{userData.isActive ? '활성' : '비활성'}</StatValue>
          <StatLabel>계정 상태</StatLabel>
        </StatCard>
      </StatsGrid>
    </Container>
  );
};

export default ProfileSection;