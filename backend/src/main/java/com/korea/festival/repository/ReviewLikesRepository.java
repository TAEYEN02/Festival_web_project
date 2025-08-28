package com.korea.festival.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.ReviewLikes;

@Repository
public interface ReviewLikesRepository extends JpaRepository<ReviewLikes, Long>{

	// 특정 리뷰에 대해 특정 사용자가 좋아요 했는지 체크
    boolean existsByReviewIdAndUserId(Long reviewId, Long userId);

    // 특정 리뷰에 대해 특정 사용자의 좋아요 엔티티 조회
    Optional<ReviewLikes> findByReviewIdAndUserId(Long reviewId, Long userId);
}
