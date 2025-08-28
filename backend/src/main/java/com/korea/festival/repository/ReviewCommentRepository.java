package com.korea.festival.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.ReviewComment;

@Repository
public interface ReviewCommentRepository extends JpaRepository<ReviewComment, Long>{

    // 특정 리뷰의 최상위 댓글들 조회 (부모가 없는 것만)
    List<ReviewComment> findByReviewIdAndParentIsNull(Long reviewId);
}
