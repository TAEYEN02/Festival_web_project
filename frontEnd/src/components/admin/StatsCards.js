// StatsCards.js
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Users, Mail, Calendar, MessageCircle, TrendingUp, TrendingDown } from 'lucide-react';

const Grid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(1, 1fr);
  @media(min-width: 640px) { grid-template-columns: repeat(2, 1fr); }
  @media(min-width: 1280px) { grid-template-columns: repeat(4, 1fr); }
`;

const Card = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
  transition: all 0.3s;
  &:hover { 
    box-shadow: 0 20px 25px rgba(0,0,0,0.15);
    transform: translateY(-4px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const CardInfo = styled.div``;

const CardTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.25rem;
`;

const CardValue = styled.p`
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
`;

const IconWrapper = styled.div`
  padding: 0.75rem;
  border-radius: 1rem;
  background: ${({ gradient }) => `linear-gradient(to right, ${gradient[0]}, ${gradient[1]})`};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
  ${Card}:hover & { transform: scale(1.1); }
`;

const Trend = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ isPositive }) => isPositive ? '#166534' : '#991b1b'};
  background: ${({ isPositive }) => isPositive ? '#d1fae5' : '#fecaca'};
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
`;

const ChangeText = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  margin-left: 0.5rem;
`;

const ProgressBarContainer = styled.div`
  margin-top: 1rem;
  height: 0.5rem;
  background: #f3f4f6;
  border-radius: 9999px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: ${({ gradient }) => `linear-gradient(to right, ${gradient[0]}, ${gradient[1]})`};
  transition: width 1s ease-out;
`;

const StatsCards = ({ stats }) => {
  const [previousStats, setPreviousStats] = useState(stats);
  const [animatedStats, setAnimatedStats] = useState(stats);

  const cardData = [
    { title: '총 사용자', value: animatedStats.totalUsers, icon: Users, gradient: ['#6366f1','#8b5cf6'], change: '+12%', changeText: '이번 달', isPositive: true },
    { title: '대기 중인 문의', value: animatedStats.pendingInquiries, icon: Mail, gradient: ['#ec4899','#f43f5e'], change: '-5%', changeText: '지난 주', isPositive: false },
    { title: '진행 중인 축제', value: animatedStats.activeFestivals, icon: Calendar, gradient: ['#3b82f6','#06b6d4'], change: '+8%', changeText: '이번 달', isPositive: true },
    { title: '채팅 활성 사용자', value: animatedStats.activeChatUsers, icon: MessageCircle, gradient: ['#10b981','#22c55e'], change: '+23%', changeText: '오늘', isPositive: true }
  ];

  useEffect(() => {
    const animateValue = (start, end, duration, callback) => {
      const startTime = Date.now();
      const step = () => {
        const progress = Math.min((Date.now() - startTime) / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        callback(current);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    Object.keys(stats).forEach(key => {
      if (previousStats[key] !== stats[key]) {
        animateValue(previousStats[key], stats[key], 1000, value => {
          setAnimatedStats(prev => ({ ...prev, [key]: value }));
        });
      }
    });

    setPreviousStats(stats);
  }, [stats, previousStats]);

  const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num);
  const maxValue = Math.max(...Object.values(stats));

  return (
    <Grid>
      {cardData.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.isPositive ? TrendingUp : TrendingDown;
        return (
          <Card key={index}>
            <CardHeader>
              <CardInfo>
                <CardTitle>{card.title}</CardTitle>
                <CardValue>{formatNumber(card.value)}</CardValue>
              </CardInfo>
              <IconWrapper gradient={card.gradient}><Icon size={24} color="white"/></IconWrapper>
            </CardHeader>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Trend isPositive={card.isPositive}>
                <TrendIcon size={12}/>
                {card.change}
              </Trend>
              <ChangeText>{card.changeText}</ChangeText>
            </div>

            <ProgressBarContainer>
              <ProgressBar gradient={card.gradient} style={{ width: `${Math.min((card.value / maxValue) * 100, 100)}%` }} />
            </ProgressBarContainer>
          </Card>
        );
      })}
    </Grid>
  );
};

export default StatsCards;
