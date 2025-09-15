package com.korea.festival.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.korea.festival.entity.FestivalLikeEntity;
import com.korea.festival.entity.Festival_MainPage;
import com.korea.festival.entity.User;
import com.korea.festival.entity.Wishlist;
import com.korea.festival.repository.FestivalLikeRepository;
import com.korea.festival.repository.MainPageRepository;
import com.korea.festival.repository.UserRepository;
import com.korea.festival.repository.WishlistRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistService {
    
	private final FestivalLikeRepository festivalLikeRepository;
    private final MainPageRepository mainPageRepository;
    private final UserRepository userRepository;
    private final WishlistRepository wishlistRepository; // ✅ 추가

    // 좋아요 추가
    public void addLike(String username, Long festivalId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Festival_MainPage festival = mainPageRepository.findById(festivalId)
                .orElseThrow(() -> new RuntimeException("축제를 찾을 수 없습니다."));

        // 이미 좋아요 했는지 확인
        if (festivalLikeRepository.existsByUserAndFestival(user, festival)) {
            throw new RuntimeException("이미 좋아요한 축제입니다.");
        }

        // FestivalLike 저장
        FestivalLikeEntity like = new FestivalLikeEntity();
        like.setUser(user);
        like.setFestival(festival);
        festivalLikeRepository.save(like);

        // Wishlist에도 추가
        if (!wishlistRepository.existsByUserAndItemTypeAndItemId(user, "festival", festival.getId())) {
            Wishlist wishlist = new Wishlist();
            wishlist.setUser(user);
            wishlist.setItemType("festival"); // 고정
            wishlist.setItemId(festival.getId());
            wishlist.setItemTitle(festival.getName());
            wishlist.setItemImage(festival.getFirstimage());
            wishlist.setItemPrice(null); // 축제는 가격 없음
            wishlistRepository.save(wishlist);
        }
    }

    // 좋아요 취소
    public void removeLike(String username, Long festivalId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Festival_MainPage festival = mainPageRepository.findById(festivalId)
                .orElseThrow(() -> new RuntimeException("축제를 찾을 수 없습니다."));

        festivalLikeRepository.deleteByUserAndFestival(user, festival);

        // Wishlist에서도 삭제
        wishlistRepository.deleteByUserAndItemTypeAndItemId(user, "festival", festival.getId());
    }
}
