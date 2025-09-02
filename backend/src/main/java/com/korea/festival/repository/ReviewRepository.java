package com.korea.festival.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // 리뷰 단건 조회 (작성자 + 댓글 + 댓글 작성자 + 대댓글 + 대댓글 작성자)
    @EntityGraph(attributePaths = {
        "user", 
        "comments", 
        "comments.user", 
        "comments.replies", 
        "comments.replies.user"
    })
    Optional<Review> findById(Long id);

    // 리뷰 전체 조회 (작성자 + 댓글 + 댓글 작성자 + 대댓글 + 대댓글 작성자)
    @EntityGraph(attributePaths = {
        "user", 
        "comments", 
        "comments.user", 
        "comments.replies", 
        "comments.replies.user"
    })
    List<Review> findAll();
}
