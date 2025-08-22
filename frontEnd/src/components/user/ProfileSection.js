import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Mail, Edit3, Save, X, Calendar, MessageSquare, Bookmark } from 'lucide-react';
import { updateUserInfo } from '../../api/user';

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

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
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

const ProfileSection = ({ userData, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: userData?.nickname || '',
    email: userData?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!userData) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      nickname: userData.nickname || '',
      email: userData.email || ''
    });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      nickname: userData.nickname || '',
      email: userData.email || ''
    });
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!formData.nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updatedUser = await updateUserInfo(formData);
      onUpdateUser(updatedUser);
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      setIsEditing(false);
      
      // 성공 메시지 3초 후 제거
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
        프로필 정보
      </Title>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

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
          {isEditing ? (
            <Input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleChange('nickname', e.target.value)}
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
          {isEditing ? (
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
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
        {isEditing ? (
          <>
            <Button variant="secondary" onClick={handleCancel} disabled={loading}>
              <X size={16} />
              취소
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={loading}>
              <Save size={16} />
              {loading ? '저장 중...' : '저장'}
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={handleEdit}>
            <Edit3 size={16} />
            프로필 수정
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