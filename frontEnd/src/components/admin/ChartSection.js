import React from 'react';
import styled from 'styled-components';
import { Activity, BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';

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

const regionIdMapping = {
  'seoul': '서울',
  'busan': '부산',
  'daegu': '대구',
  'incheon': '인천',
  'gwangju': '광주',
  'daejeon': '대전',
  'ulsan': '울산',
  'gyeonggi': '경기',
  'gangwon': '강원',
  'north-chungcheong': '충북',
  'south-chungcheong': '충남',
  'north-jeolla': '전북',
  'south-jeolla': '전남',
  'north-gyeongsang': '경북',
  'south-gyeongsang': '경남',
  'jeju': '제주'
};

const ChartSection = ({ growthData, regionData }) => {
  return (
    <Grid>
      <Card>
        <CardTitle>사용자 증가 추이</CardTitle>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={growthData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="newUsers" stroke="#2563eb" name="신규 사용자" />
            <Line dataKey="totalUsers" stroke="#f97316" name="총 사용자" />
          </LineChart>

        </ResponsiveContainer>
      </Card>

      <Card>
        <CardTitle>지역별 채팅 활동</CardTitle>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={regionData}>
            <XAxis dataKey="region" tickFormatter={d => regionIdMapping[d]} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="messageCount" fill="#2563eb" name="메시지 수" />
            <Bar dataKey="activeUsers" fill="#f97316" name="활성 사용자" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Grid>
  );
};

export default ChartSection;