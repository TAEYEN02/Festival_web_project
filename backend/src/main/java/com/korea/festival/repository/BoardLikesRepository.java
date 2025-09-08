package com.korea.festival.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.BoardLikes;

import org.springframework.data.repository.query.Param;

@Repository
public interface BoardLikesRepository extends JpaRepository<BoardLikes, Long> {

    // 특정 게시글에 대해 특정 사용자가 좋아요 눌렀는지 체크
    @Query("SELECT CASE WHEN COUNT(bl) > 0 THEN true ELSE false END " +
           "FROM BoardLikes bl WHERE bl.board.id = :boardId AND bl.user.id = :userId")
    boolean existsByBoardIdAndUserId(@Param("boardId") Long boardId, @Param("userId") Long userId);

    // 특정 게시글, 사용자 좋아요 엔티티 가져오기(토글)
    @Query("SELECT bl FROM BoardLikes bl WHERE bl.board.id = :boardId AND bl.user.id = :userId")
    Optional<BoardLikes> findByBoardIdAndUserId(@Param("boardId") Long boardId, @Param("userId") Long userId);
}
