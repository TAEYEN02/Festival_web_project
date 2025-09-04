package com.korea.festival.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.ReviewComment;

@Repository
public interface ReviewCommentRepository extends JpaRepository<ReviewComment, Long>{

    // 특정 리뷰에 속한 최상위 댓글 목록을 조회하는 메서드
    List<ReviewComment> findByReviewIdAndParentIsNull(Long reviewId);
}
