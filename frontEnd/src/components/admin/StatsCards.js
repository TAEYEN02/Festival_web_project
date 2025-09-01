// src/components/StatsCards.js
import React from 'react';
import styled from 'styled-components';
import { Users, Mail, Calendar, MessageCircle } from 'lucide-react';

const StatsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(1, 1fr);
  
  @media(min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media(min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatsCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CardInfo = styled.div``;

const CardTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
`;

const CardValue = styled.p`
  font-size: 2rem;
  font-weight: bold;
  color: #111827;
  margin: 0;
`;

const CardIconWrapper = styled.div`
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: ${({ $color }) => {
    const colors = {
      blue: 'linear-gradient(to right, #dbeafe, #bfdbfe)',
      red: 'linear-gradient(to right, #fecaca, #fca5a5)',
      green: 'linear-gradient(to right, #d1fae5, #a7f3d0)',
      purple: 'linear-gradient(to right, #e9d5ff, #ddd6fe)'
    };
    return colors[$color] || colors.blue;
  }};
  color: ${({ $color }) => {
    const colors = {
      blue: '#1d4ed8',
      red: '#dc2626',
      green: '#059669',
      purple: '#7c3aed'
    };
    return colors[$color] || colors.blue;
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
  
  ${StatsCard}:hover & {
    transform: scale(1.1);
  }
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ChangeIndicator = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? '#059669' : '#dc2626')};
`;

const ChangeText = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const StatsCards = ({ stats }) => {
  const cardData = [
    { 
      title: '총 사용자', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'blue',
      positive: true
    },
    { 
      title: '대기 중인 문의', 
      value: stats?.pendingInquiries || 0, 
      icon: Mail, 
      color: 'red',
      positive: false
    }
  ];

  const formatNumber = (num) => new Intl.NumberFormat('ko-KR').format(num);

  return (
    <StatsGrid>
      {cardData.map((card, index) => {
        const Icon = card.icon;
        return (
          <StatsCard key={index}>
            <CardHeader>
              <CardInfo>
                <CardTitle>{card.title}</CardTitle>
                <CardValue>{formatNumber(card.value)}</CardValue>
              </CardInfo>
              <CardIconWrapper $color={card.color}>
                <Icon size={24} />
              </CardIconWrapper>
            </CardHeader>
            
            <CardFooter>
              <ChangeIndicator $positive={card.positive}>
                {card.change}
              </ChangeIndicator>
              <ChangeText>{card.changeText}</ChangeText>
            </CardFooter>
          </StatsCard>
        );
      })}
    </StatsGrid>
  );
};

export default StatsCards;