import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Bookmark, Heart, Trash2, Calendar } from 'lucide-react';
import { fetchMyLikedFestivals, toggleFestivalLike } from '../../api/festivalLike';
import axios from 'axios';
import ConfirmModal from '../common/ConfirmModal';

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

const WishlistCard = styled.div`
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
  cursor: pointer;
  
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

const ItemImage = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemLocation = styled.div`
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 0.25rem;
`;

const ItemMeta = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
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

const Itemdday = styled.div`
  font-weight: 650;
  color: #ff5252ff;
  font-size : 14px;
  margin-top : 7px;
  margin-bottom: 0.25rem;
`;


const ScrapSection = ({ token }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  const navigate = useNavigate();

  // 좋아요 목록 불러오기
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        if (!token) throw new Error("로그인이 필요합니다.");
        const data = await fetchMyLikedFestivals(token); // token 전달
        console.log("좋아요 목록 데이터 확인:", data);
        setWishlist(data || []);
      } catch (err) {
        console.error('좋아요 목록 로드 실패:', err);
        setError('좋아요 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, [token]);

  const handleRemoveItem = (item, e) => {
    e.stopPropagation();
    setItemToRemove(item);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;
    try {
      await toggleFestivalLike(itemToRemove.contentId, token); // 좋아요 토글 API
      setWishlist(prev => prev.filter(w => w.id !== itemToRemove.id));
    } catch (err) {
      console.error('좋아요 취소 실패:', err);
      setError('좋아요 취소에 실패했습니다.');
    } finally {
      setItemToRemove(null);
      setShowRemoveConfirm(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Title>
          <Bookmark size={24} />
          좋아요 누른 축제
        </Title>
        <LoadingState>좋아요 목록을 불러오는 중...</LoadingState>
      </Container>
    );
  }


  // 상세페이지 이동
  const handleCardClick = (item) => {
    if (!item.contentId) return;
    navigate(`/festival/${item.contentId}`);
  };


  return (
    <Container>
      <Title>
        <Bookmark size={24} />
        좋아요 누른 축제 ({wishlist.length})
      </Title>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {wishlist.length === 0 ? (
        <EmptyState>
          <Heart size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>좋아요한 항목이 없습니다.</p>
          <p style={{ fontSize: '0.875rem' }}>마음에 드는 축제나 이벤트를 추가해보세요!</p>
        </EmptyState>
      ) : (
        <Grid>
          {wishlist.map(item => (
            <WishlistCard key={item.id} onClick={() => handleCardClick(item)}>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <RemoveButton onClick={(e) => handleRemoveItem(item, e)}>
                  <Trash2 size={16} />
                </RemoveButton>
              </CardHeader>

              <CardContent>
                <ItemImage>
                  {item.firstimage ? (
                    <img
                      src={item.firstimage}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
                    />
                  ) : (
                    <Heart size={24} />
                  )}
                </ItemImage>

                <ItemInfo>
                <ItemLocation>{item.location || '위치 정보 없음'}</ItemLocation>

                <ItemMeta>
                  <Calendar size={14} />
                  {item.startDate && item.endDate 
                    ? `${item.startDate} ~ ${item.endDate}` 
                    : '기간 정보 없음'}
                </ItemMeta>

                {/* D-DAY 계산 */}
                {item.startDate && item.endDate && (() => {
                  const today = new Date();
                  const start = new Date(item.startDate);
                  const end = new Date(item.endDate);

                  const diffToStart = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
                  const diffToEnd = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

                  let status = '';
                  let text = '';

                  if (diffToStart > 0) {
                    status = 'upcoming';
                    text = `D-${diffToStart}`;
                  } else if (diffToStart === 0) {
                    status = 'today';
                    text = 'D-Day';
                  } else if (diffToStart < 0 && diffToEnd >= 0) {
                    status = 'ongoing';
                    text = '진행중';
                  } else {
                    status = 'ended';
                    text = '종료';
                  }

                  return <Itemdday className={status}>{text}</Itemdday>;
                })()}
              </ItemInfo>

              </CardContent>
            </WishlistCard>
          ))}
        </Grid>
      )}

      <ConfirmModal
        isOpen={showRemoveConfirm}
        onClose={() => {
          setShowRemoveConfirm(false);
          setItemToRemove(null);
        }}
        onConfirm={confirmRemoveItem}
        title="좋아요 목록에서 제거"
        message={`"${itemToRemove?.name}"을(를) 좋아요 목록에서 제거하시겠습니까?`}
        confirmText="제거"
        cancelText="취소"
        variant="danger"
      />
    </Container>
  );
};

export default ScrapSection;
