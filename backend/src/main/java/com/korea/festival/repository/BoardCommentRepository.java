package com.korea.festival.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.BoardComment;

@Repository
public interface BoardCommentRepository extends JpaRepository<BoardComment, Long>{

	 // 최상위 댓글만 조회 (부모가 없는 댓글)
    List<BoardComment> findByBoardIdAndParentIsNull(Long boardId);
    
    // 특정 부모 댓글의 대댓글 조회
    List<BoardComment> findByParentId(Long parentId);
}
