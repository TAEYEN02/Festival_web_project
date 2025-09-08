package com.korea.festival.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.korea.festival.entity.FestivalLikeEntity;
import com.korea.festival.entity.User;

public interface FestivalLikeRepository extends JpaRepository<FestivalLikeEntity, Long> {

	boolean existsByUserAndFestival_ContentId(User user, String contentId);

	 // userId + festivalId로 좋아요 조회
	@Query("SELECT f FROM FestivalLikeEntity f WHERE f.user = :user AND f.festival.contentId = :contentId")
    Optional<FestivalLikeEntity> findByUserAndFestivalContentId(@Param("user") User user, @Param("contentId") String contentId);
	
	// 좋아요 삭제
    void deleteAllByUserIdAndFestivalId(Long userId, Long festivalId);

	int countByFestival_ContentId(String contentId);
}
