import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Star, Trash2, Calendar } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';
import { fetchMyItineraries, deleteItinerary } from '../../api/mypage'; // 경로 조정

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
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  gap: 1rem;
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Card = styled.div`
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  &:hover {
    background: #f3f4f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const CardTitle = styled.h3`
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
`;

const RemoveButton = styled.button`
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #ef4444;
  border-radius: 0.375rem;
  &:hover {
    background: #fef2f2;
  }
`;

const CardContent = styled.div`
  display: flex;
  gap: 1rem;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemMeta = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
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

const MyItineraries = () => {
  const [itins, setItins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  // 목록 불러오기
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchMyItineraries(0, 50);
        const list = Array.isArray(res) ? res : (res.items || res.content || []);
        setItins(list || []);
      } catch (err) {
        console.error('일정 목록 로드 실패:', err);
        setError('AI 일정 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRemoveItem = (item) => {
    setItemToRemove(item);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;
    try {
      await deleteItinerary(itemToRemove.id);
      setItins(prev => prev.filter(it => it.id !== itemToRemove.id));
    } catch (err) {
      console.error('일정 삭제 실패:', err);
      setError('일정 삭제에 실패했습니다.');
    } finally {
      setItemToRemove(null);
      setShowRemoveConfirm(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Title>
          <Star size={24} />
          AI 일정 추천 목록
        </Title>
        <LoadingState>불러오는 중...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>
        <Star size={24} />
        AI 일정 추천 목록 ({itins.length})
      </Title>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {itins.length === 0 ? (
        <EmptyState>
          <Star size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>저장된 AI 일정이 없습니다.</p>
          <p style={{ fontSize: '0.875rem' }}>여행 플래너에서 일정을 생성하고 저장해보세요.</p>
        </EmptyState>
      ) : (
        <Grid>
          {itins.map(item => {
            const title =
              item.title ||
              item.plan?.title ||
              item.destinationName ||
              item.destination?.name ||
              '제목 없음';
            const start =
              item.periodStart ||
              item.options?.startDate ||
              '';
            const end =
              item.periodEnd ||
              item.options?.endDate ||
              '';

            return (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                  <RemoveButton onClick={() => handleRemoveItem(item)}>
                    <Trash2 size={16} />
                  </RemoveButton>
                </CardHeader>
                <CardContent>
                  <ItemInfo>
                    <div style={{ fontWeight: 600, color: "#4f46e5" }}>
                      {item.destinationName || item.destination?.name || "-"}
                    </div>
                    <ItemMeta>
                      <Calendar size={14} />
                      {start && end ? `${start} ~ ${end}` : '기간 정보 없음'}
                    </ItemMeta>
                  </ItemInfo>
                </CardContent>
              </Card>
            );
          })}
        </Grid>
      )}

      <ConfirmModal
        isOpen={showRemoveConfirm}
        onClose={() => {
          setShowRemoveConfirm(false);
          setItemToRemove(null);
        }}
        onConfirm={confirmRemoveItem}
        title="일정 삭제"
        message={`"${itemToRemove?.title || itemToRemove?.plan?.title || itemToRemove?.destinationName || itemToRemove?.destination?.name || ""}" 일정을 삭제하시겠습니까?`}
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
      />
    </Container>
  );
};

export default MyItineraries;
