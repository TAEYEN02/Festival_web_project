package com.korea.festival.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.BoardLikes;

@Repository
public interface BoardLikesRepository extends JpaRepository<BoardLikes, Long>{
	
	// 특정 게시글에 대해 특정 사용자가 좋아요 눌렀는지 체크
	boolean existsByBoardIdAndUserId(Long boardId,Long userId);
	
	// 특정 게시글, 사용자 좋아요 엔티티 가져오기(토글)
	Optional<BoardLikes> findByBoardIdAndUserId(Long boardId,Long userId);
}
