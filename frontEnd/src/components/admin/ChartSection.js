// src/components/ChartSection.js
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
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: #111827;
  margin: 0 0 1rem 0;
`;

const ChartPlaceholder = styled.div`
  height: 16rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #6b7280;
  gap: 0.5rem;
`;

const PlaceholderText = styled.p`
  margin: 0;
  font-size: 1rem;
`;

const PlaceholderSubtext = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #9ca3af;
`;

const ChartSection = ({ growthData }) => {
  return (
    <Grid>
      <Card>
        <CardTitle>사용자 증가 추이</CardTitle>
        <ChartPlaceholder>
          <Activity size={48} />
          <PlaceholderText>사용자 증가 차트 영역</PlaceholderText>
          <PlaceholderSubtext>Chart.js 또는 Recharts 연동</PlaceholderSubtext>
        </ChartPlaceholder>
      </Card>

      <Card>
        <CardTitle>지역별 채팅 활동</CardTitle>
        <ChartPlaceholder>
          <BarChart3 size={48} />
          <PlaceholderText>지역별 채팅 활동 차트 영역</PlaceholderText>
          <PlaceholderSubtext>실시간 데이터 시각화</PlaceholderSubtext>
        </ChartPlaceholder>
      </Card>
    </Grid>
  );
};

export default ChartSection;