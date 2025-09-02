package com.korea.festival.service;

import java.util.Optional;

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

    // 좋아요 토글
    @Transactional
    public String toggleLike(String username, String contentId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        Optional<FestivalLikeEntity> existingLike = likeRepository.findByUserAndFestival_ContentId(user, contentId);

        Festival_MainPage festival = mainPageRepository.findByContentId(contentId)
                .orElseThrow(() -> new RuntimeException("축제를 찾을 수 없습니다"));

        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            festival.setLikesCount(festival.getLikesCount() - 1);
            return "unliked";
        } else {
        	
        	FestivalLikeEntity like = new FestivalLikeEntity();
        	like.setUser(user);
        	like.setFestival(festival);
        	likeRepository.save(like);
        	
            likeRepository.save(like);
            festival.setLikesCount(festival.getLikesCount() + 1);
            return "liked";
        }
    }

    

    // 좋아요 수 조회
    @Transactional(readOnly = true)
    public int getLikeCount(String contentId) {
        Festival_MainPage festival = mainPageRepository.findByContentId(contentId)
                .orElseThrow(() -> new RuntimeException("축제를 찾을 수 없습니다"));
        return festival.getLikesCount();
    }

    // 사용자의 좋아요 여부 확인
    @Transactional(readOnly = true)
    public boolean isLikedByUser(String contentId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));

        // 이제 contentId 자체를 전달
        return likeRepository.existsByUserAndFestival_ContentId(user, contentId);
    }

}
