import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Bookmark, Heart, Trash2, Calendar, ExternalLink } from 'lucide-react';
import { fetchMyWishlist, removeFromWishlist } from '../../api/mypage';
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

const ItemPrice = styled.div`
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

const ScrapSection = ({ userId }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 커스텀 모달 상태 추가
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);


  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetchMyWishlist(0, 20);
      setWishlist(response.content || []);
    } catch (err) {
      console.error('찜 목록 로드 실패:', err);
      setError('찜 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (item, e) => {
    e.stopPropagation();
    
    // 커스텀 모달로 변경
    setItemToRemove(item);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;

    try {
      await removeFromWishlist(itemToRemove.itemType, itemToRemove.itemId);
      setWishlist(prev => prev.filter(w => w.id !== itemToRemove.id));
    } catch (err) {
      console.error('찜 제거 실패:', err);
      setError('찜 제거에 실패했습니다.');
    } finally {
      setItemToRemove(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatPrice = (price) => {
    if (!price) return '가격 정보 없음';
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  if (loading) {
    return (
      <Container>
        <Title>
          <Bookmark size={24} />
          찜 목록
        </Title>
        <LoadingState>찜 목록을 불러오는 중...</LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Title>
        <Bookmark size={24} />
        찜 목록 ({wishlist.length})
      </Title>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {wishlist.length === 0 ? (
        <EmptyState>
          <Heart size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>찜한 항목이 없습니다.</p>
          <p style={{ fontSize: '0.875rem' }}>마음에 드는 축제나 이벤트를 찜해보세요!</p>
        </EmptyState>
      ) : (
        <Grid>
          {wishlist.map(item => (
            <WishlistCard key={item.id}>
              <CardHeader>
                <CardTitle>{item.itemTitle}</CardTitle>
                <RemoveButton onClick={(e) => handleRemoveItem(item, e)}>
                  <Trash2 size={16} />
                </RemoveButton>
              </CardHeader>

              <CardContent>
                <ItemImage>
                  {item.itemImage ? (
                    <img
                      src={item.itemImage}
                      alt={item.itemTitle}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }}
                    />
                  ) : (
                    <Heart size={24} />
                  )}
                </ItemImage>

                <ItemInfo>
                  <ItemPrice>{formatPrice(item.itemPrice)}</ItemPrice>
                  <ItemMeta>
                    <Calendar size={14} />
                    {formatDate(item.createdAt)}
                  </ItemMeta>
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
        title="찜 목록에서 제거"
        message={`"${itemToRemove?.itemTitle}"을(를) 찜 목록에서 제거하시겠습니까?`}
        confirmText="제거"
        cancelText="취소"
        variant="danger"
      />
    </Container>
  );
};

export default ScrapSection;