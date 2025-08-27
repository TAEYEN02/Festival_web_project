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
	public ResponseEntity<?> boardWrite(@RequestBody BoardRequestDTO dto,@RequestParam Long userId){
		BoardResponseDTO result = boardService.boardWrtie(dto,userId);
		return ResponseEntity.ok().body(result);
	}
	
	//r-all
	@GetMapping
	public ResponseEntity<?> boardFindAll(@RequestParam(required = false)Long userId){
		List<BoardResponseDTO> result = boardService.boardFindAll(userId);
		return ResponseEntity.ok().body(result);
	}
	
	//r-detail
	@GetMapping("/{boardId}")
	public ResponseEntity<?> boardFindOne(@PathVariable Long boardId,@RequestParam(required = false)Long userId){
		BoardResponseDTO result = boardService.boardFindOne(boardId,userId); 
		return ResponseEntity.ok().body(result);
	}
	
	//u
	@PutMapping
	public ResponseEntity<?> boardUpdate(@RequestBody BoardRequestDTO dto,@RequestParam Long userId){
		BoardResponseDTO result = boardService.boardUpdate(dto,userId);
		return ResponseEntity.ok().body(result);
	}
	
	//d
	@DeleteMapping("/{boardId}")
	public ResponseEntity<?> boardDelete(@PathVariable Long boardId,@RequestParam Long userId){
		BoardResponseDTO result = boardService.boardDelete(boardId,userId);
		return ResponseEntity.ok().body(result);
	}
	
	//like
	@PostMapping("/{boardId}/like")
	public ResponseEntity<?> likeToggle(@PathVariable Long boardId,@RequestParam Long userId){
		BoardResponseDTO result = boardService.likeToggle(boardId,userId);
		return ResponseEntity.ok().body(result);
	}

}
