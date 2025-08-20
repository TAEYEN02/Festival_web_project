// ScrapSection.js
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.75rem;
`;

const DateText = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ScrapSection = ({ userId }) => {
  const dummyScraps = [
    { id: 1, title: '축제 A', date: '2024-01-10' },
    { id: 2, title: '축제 B', date: '2024-01-12' },
    { id: 3, title: '축제 C', date: '2024-01-15' },
  ];

  return (
    <Container>
      <Title>스크랩 목록</Title>
      <List>
        {dummyScraps.map(scrap => (
          <ListItem key={scrap.id}>
            <span>{scrap.title}</span>
            <DateText>{scrap.date}</DateText>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default ScrapSection;
