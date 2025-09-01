package com.korea.festival.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.korea.festival.dto.BoardCommentRequestDTO;
import com.korea.festival.dto.BoardCommentResponseDTO;
import com.korea.festival.dto.BoardRequestDTO;
import com.korea.festival.dto.BoardResponseDTO;
import com.korea.festival.service.BoardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
public class BoardController {
	
	private final BoardService boardService;
	
	//c
	@PostMapping
	public ResponseEntity<?> boardWrite(@RequestBody BoardRequestDTO dto,@RequestParam("userId") Long userId){
		BoardResponseDTO result = boardService.boardWrtie(dto,userId);
		return ResponseEntity.ok().body(result);
	}
	
	//r-all
	@GetMapping
	public ResponseEntity<?> boardFindAll(@RequestParam(name = "userId",required = false)Long userId){
		List<BoardResponseDTO> result = boardService.boardFindAll(userId);
		return ResponseEntity.ok().body(result);
	}
	
	//r-detail
	@GetMapping("/{boardId}")
	public ResponseEntity<?> boardFindOne(@PathVariable(name = "boardId") Long boardId,@RequestParam(name = "userId",required = false)Long userId){
		BoardResponseDTO result = boardService.boardFindOne(boardId,userId); 
		return ResponseEntity.ok().body(result);
	}
	
	//u
	@PutMapping
	public ResponseEntity<?> boardUpdate(@RequestBody BoardRequestDTO dto,@RequestParam("userId") Long userId){
		BoardResponseDTO result = boardService.boardUpdate(dto,userId);
		return ResponseEntity.ok().body(result);
	}
	
	//d
	@DeleteMapping("/{boardId}")
	public ResponseEntity<?> boardDelete(@PathVariable(name = "boardId") Long boardId,@RequestParam("userId") Long userId){
		boolean result = boardService.boardDelete(boardId,userId);
		return ResponseEntity.ok().body(result);
	}
	
	//like
	@PostMapping("/{boardId}/like")
	public ResponseEntity<?> likeToggle(@PathVariable(name = "boardId") Long boardId,@RequestParam("userId") Long userId){
		BoardResponseDTO result = boardService.likeToggle(boardId,userId);
		return ResponseEntity.ok().body(result);
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
    // 댓글 작성
    @PostMapping("/comment")
    public ResponseEntity<BoardCommentResponseDTO> commentWrite(@RequestBody BoardCommentRequestDTO requestDTO) {
        return ResponseEntity.ok(boardService.commentWrite(requestDTO));
    }

    // 댓글 수정
    @PutMapping("/comment/{id}")
    public ResponseEntity<BoardCommentResponseDTO> commentUpdate(
            @PathVariable(name = "id") Long id,
            @RequestBody BoardCommentRequestDTO requestDTO) {
        return ResponseEntity.ok(boardService.commentUpdate(id, requestDTO));
    }

    // 댓글 삭제
    @DeleteMapping("/comment/{id}")
    public ResponseEntity<Void> commentDelete(@PathVariable(name = "id") Long id) {
        boardService.commentDelete(id);
        return ResponseEntity.noContent().build();
    }

    // 단일 댓글 조회
    @GetMapping("/comment/{id}")
    public ResponseEntity<BoardCommentResponseDTO> commentFindOne(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(boardService.commentFindOne(id));
    }

    // 게시글 댓글 전체 조회
    @GetMapping("/comment/{boardId}")
    public ResponseEntity<List<BoardCommentResponseDTO>> commentFindAll(@PathVariable(name = "id") Long boardId) {
        return ResponseEntity.ok(boardService.commentFindAll(boardId));
    }

}
