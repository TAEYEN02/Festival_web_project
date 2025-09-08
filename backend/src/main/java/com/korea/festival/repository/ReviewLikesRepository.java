package com.korea.festival.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.ReviewLikes;

@Repository
public interface ReviewLikesRepository extends JpaRepository<ReviewLikes, Long>{

	 // 좋아요 존재 여부 확인
    @Query("SELECT CASE WHEN COUNT(rl) > 0 THEN true ELSE false END " +
           "FROM ReviewLikes rl WHERE rl.review.id = :reviewId AND rl.user.id = :userId")
    boolean existsByReviewIdAndUserId(@Param("reviewId") Long reviewId, @Param("userId") Long userId);

    // 특정 리뷰의 특정 사용자의 좋아요 엔티티 조회
    @Query("SELECT rl FROM ReviewLikes rl WHERE rl.review.id = :reviewId AND rl.user.id = :userId")
    Optional<ReviewLikes> findByReviewIdAndUserId(@Param("reviewId") Long reviewId, @Param("userId") Long userId);

}
