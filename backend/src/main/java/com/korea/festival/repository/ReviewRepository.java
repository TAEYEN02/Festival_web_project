package com.korea.festival.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // 특정 리뷰를 조회할 때 연관된 댓글을 함께 가져오는 쿼리
    @Query("SELECT r FROM Review r LEFT JOIN FETCH r.comments WHERE r.id = :id")
    Optional<Review> findByIdWithComments(@Param("id") Long id);

    // 모든 리뷰를 조회할 때 연관된 댓글을 함께 가져오는 쿼리
    @Query("SELECT DISTINCT r FROM Review r LEFT JOIN FETCH r.comments")
    List<Review> findAllWithComments();
}
