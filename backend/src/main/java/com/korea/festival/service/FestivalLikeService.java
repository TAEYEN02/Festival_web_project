package com.korea.festival.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.korea.festival.dto.FestivalLikeDTO;
import com.korea.festival.entity.FestivalLikeEntity;
import com.korea.festival.entity.Festival_MainPage;
import com.korea.festival.entity.User;
import com.korea.festival.repository.FestivalLikeRepository;
import com.korea.festival.repository.MainPageRepository;
import com.korea.festival.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FestivalLikeService {
    
	private final FestivalLikeRepository likeRepo;
    private final MainPageRepository mainRepo;
    private final UserRepository userRepo;

    
    // 좋아요 토글
    @Transactional
    public FestivalLikeDTO toggleLike(Long festivalId, Long userId) {
        User user = userRepo.findById(userId).orElseThrow();
        Festival_MainPage festival = mainRepo.findById(festivalId).orElseThrow();

        Optional<FestivalLikeEntity> existing = likeRepo.findByUserAndFestival(user, festival);

        boolean liked;
        if (existing.isPresent()) {
            likeRepo.delete(existing.get());
            liked = false;
            festival.setLikesCount(festival.getLikesCount() - 1); // 컬럼 감소
        } else {
            likeRepo.save(FestivalLikeEntity.builder()
                    .user(user)
                    .festival(festival)
                    .build());
            liked = true;
            festival.setLikesCount(festival.getLikesCount() + 1); // 컬럼 증가
        }

        mainRepo.save(festival); // 반드시 저장
        return new FestivalLikeDTO(liked, festival.getLikesCount());
    }


    // 특정 축제에 대해 현재 로그인한 사용자가 좋아요 눌렀는지 확인
    public FestivalLikeDTO getLikeStatus(Long festivalId, Long userId) {
        User user = userRepo.findById(userId).orElseThrow();
        Festival_MainPage festival = mainRepo.findById(festivalId).orElseThrow();
        boolean liked = likeRepo.findByUserAndFestival(user, festival).isPresent();
        int likeCount = likeRepo.countByFestival(festival);
        return new FestivalLikeDTO(liked, likeCount);
    }

    
    // 좋아요 수
    public long countLikes(Long festivalId) {
        Festival_MainPage festival = mainRepo.findById(festivalId).orElseThrow();
        return likeRepo.countByFestival(festival);
    }
}
