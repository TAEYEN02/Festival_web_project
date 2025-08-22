// src/components/admin/SystemSettings.js
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0;
`;

const SettingsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const SettingCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const CardIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  background: ${props => props.color || '#e5e7eb'};
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const CardContent = styled.div`
  margin-bottom: 1rem;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;

const SettingValue = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #2563eb;
  }

  &:checked + span:before {
    transform: translateX(20px);
  }
`;

const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.4s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: ${props => props.variant === 'danger' ? '#ef4444' : '#2563eb'};
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.variant === 'danger' ? '#dc2626' : '#1d4ed8'};
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  width: 80px;
`;

const AlertBox = styled.div`
  background: ${props => props.type === 'success' ? '#f0f9f4' : '#fef2f2'};
  border: 1px solid ${props => props.type === 'success' ? '#bbf7d0' : '#fecaca'};
  color: ${props => props.type === 'success' ? '#065f46' : '#991b1b'};
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const SystemSettings = () => {
  const defaultSettings = {
    system: { maintenanceMode: false, maxUsers: 1000, sessionTimeout: 30, debugMode: false },
    security: { twoFactorAuth: true, passwordPolicy: 'strong', loginAttempts: 5, sessionEncryption: true },
    notifications: { emailNotifications: true, smsNotifications: false, pushNotifications: true, adminAlerts: true },
    performance: { cacheEnabled: true, compressionEnabled: true, cdnEnabled: false, logLevel: 'info' },
    backup: { autoBackup: true, backupFrequency: 'daily', retentionDays: 30, cloudBackup: false },
    monitoring: { systemHealth: true, userActivity: true, errorTracking: true, performanceMetrics: true }
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ API에서 설정 불러오기
  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/admin/settings");
      setSettings(res.data);
    } catch (err) {
      console.error("설정 불러오기 실패:", err);
      setMessage({ type: 'error', text: '설정을 불러오지 못했습니다.' });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // ✅ 토글 핸들러
  const handleToggle = (category, key) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: !prev[category][key] }
    }));
  };

  const handleSelectChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value }
    }));
  };

  const handleInputChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: parseInt(value) || value }
    }));
  };

  // ✅ 저장 (PUT /api/admin/settings)
  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put("/api/admin/settings", settings);
      setMessage({ type: 'success', text: '설정이 성공적으로 저장되었습니다 ✅' });
    } catch (error) {
      console.error("저장 실패:", error);
      setMessage({ type: 'error', text: '설정 저장에 실패했습니다 ❌' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // ✅ 리셋 (서버에서 다시 불러오기)
  const handleReset = async () => {
    if (window.confirm("모든 설정을 서버 값으로 되돌리시겠습니까?")) {
      await fetchSettings();
      setMessage({ type: 'success', text: '설정이 서버 값으로 복원되었습니다 ↩️' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <Container>
      <Header>
        <Title>시스템 설정</Title>
        <Subtitle>시스템의 전반적인 설정을 관리합니다</Subtitle>
      </Header>

      {message && <AlertBox type={message.type}>{message.text}</AlertBox>}

      <SettingsGrid>
        {/* (👉 여기까지 기존 시스템, 보안, 알림, 성능, 백업, 모니터링 카드 그대로 유지) */}

        {/* 모니터링 설정 마지막 이어서 */}
        <SettingCard>
          <CardHeader>
            <CardIcon color="#f3e8ff">📊</CardIcon>
            <CardTitle>모니터링</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingItem>
              <SettingLabel>시스템 상태 모니터링</SettingLabel>
              <Switch>
                <SwitchInput
                  type="checkbox"
                  checked={settings.monitoring.systemHealth}
                  onChange={() => handleToggle('monitoring', 'systemHealth')}
                />
                <SwitchSlider />
              </Switch>
            </SettingItem>
            <SettingItem>
              <SettingLabel>사용자 활동 추적</SettingLabel>
              <Switch>
                <SwitchInput
                  type="checkbox"
                  checked={settings.monitoring.userActivity}
                  onChange={() => handleToggle('monitoring', 'userActivity')}
                />
                <SwitchSlider />
              </Switch>
            </SettingItem>
            <SettingItem>
              <SettingLabel>오류 추적</SettingLabel>
              <Switch>
                <SwitchInput
                  type="checkbox"
                  checked={settings.monitoring.errorTracking}
                  onChange={() => handleToggle('monitoring', 'errorTracking')}
                />
                <SwitchSlider />
              </Switch>
            </SettingItem>
            <SettingItem>
              <SettingLabel>성능 메트릭</SettingLabel>
              <Switch>
                <SwitchInput
                  type="checkbox"
                  checked={settings.monitoring.performanceMetrics}
                  onChange={() => handleToggle('monitoring', 'performanceMetrics')}
                />
                <SwitchSlider />
              </Switch>
            </SettingItem>
          </CardContent>
        </SettingCard>
      </SettingsGrid>

      {/* ✅ 저장 & 리셋 버튼 */}
      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <Button onClick={handleSave} disabled={loading}>저장</Button>
        <Button variant="danger" onClick={handleReset}>리셋</Button>
      </div>
    </Container>
  );
};

export default SystemSettings;