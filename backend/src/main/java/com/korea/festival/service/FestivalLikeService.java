package com.korea.festival.service;

import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.korea.festival.entity.FestivalLikeEntity;
import com.korea.festival.entity.Festival_MainPage;
import com.korea.festival.entity.User;
import com.korea.festival.repository.FestivalLikeRepository;
import com.korea.festival.repository.MainPageRepository;
import com.korea.festival.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FestivalLikeService {

    private final FestivalLikeRepository likeRepository;
    private final MainPageRepository mainPageRepository;
    private final UserRepository userRepository;

    @Transactional
    public String toggleLike(String username, String contentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Festival_MainPage festival = mainPageRepository.findByContentId(contentId)
                .orElseThrow(() -> new RuntimeException("축제를 찾을 수 없습니다."));

        Optional<FestivalLikeEntity> existingLike = likeRepository.findByUserAndFestival(user, festival);

        if (existingLike.isPresent()) {
            // 좋아요 취소
            likeRepository.delete(existingLike.get());
            festival.decreaseLikes();   // 좋아요 수 -1
            return "unliked";
        } else {
            // 좋아요 추가
            FestivalLikeEntity like = new FestivalLikeEntity();
            like.setUser(user);
            like.setFestival(festival);
            likeRepository.save(like);

            festival.increaseLikes();   // 좋아요 수 +1
            return "liked";
        }
    }


    /**
     * 특정 축제 좋아요 수 조회
     */
    @Transactional(readOnly = true)
    public int getLikeCount(String contentId) {
        Festival_MainPage festival = mainPageRepository.findByContentId(contentId)
                .orElseThrow(() -> new RuntimeException("축제를 찾을 수 없습니다."));
        return likeRepository.countByFestival(festival);
    }

    /**
     * 사용자가 특정 축제를 좋아요했는지 여부
     */
    @Transactional(readOnly = true)
    public boolean isLikedByUser(String contentId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Festival_MainPage festival = mainPageRepository.findByContentId(contentId)
                .orElseThrow(() -> new RuntimeException("축제를 찾을 수 없습니다."));

        return likeRepository.existsByUserAndFestival(user, festival);
    }
}
