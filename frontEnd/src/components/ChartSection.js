import React from 'react';
import styled from 'styled-components';
import { Activity, BarChart3 } from 'lucide-react';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media(min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Card = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
`;

const ChartPlaceholder = styled.div`
  height: 16rem;
  background: linear-gradient(to bottom right, #f9fafb, #f3f4f6);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #6b7280;
`;

const ChartSection = () => (
  <Grid>
    <Card>
      <h3>사용자 증가 추이</h3>
      <ChartPlaceholder>
        <Activity size={48} />
        <p>사용자 증가 차트 영역</p>
        <p style={{ fontSize: '0.8rem' }}>Chart.js 또는 Recharts 연동</p>
      </ChartPlaceholder>
    </Card>

    <Card>
      <h3>지역별 채팅 활동</h3>
      <ChartPlaceholder>
        <BarChart3 size={48} />
        <p>지역별 채팅 활동 차트 영역</p>
        <p style={{ fontSize: '0.8rem' }}>실시간 데이터 시각화</p>
      </ChartPlaceholder>
    </Card>
  </Grid>
);

export default ChartSection;
