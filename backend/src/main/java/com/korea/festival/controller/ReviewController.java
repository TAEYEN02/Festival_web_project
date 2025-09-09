package com.korea.festival.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.korea.festival.dto.ReviewCommentRequestDTO;
import com.korea.festival.dto.ReviewCommentResponseDTO;
import com.korea.festival.dto.ReviewRequestDTO;
import com.korea.festival.dto.ReviewResponseDTO;
import com.korea.festival.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/review")
public class ReviewController {

	 private final ReviewService reviewService;

	    // c
		 @PostMapping
		 public ResponseEntity<?> reviewWrite(
		         @RequestPart("dto") ReviewRequestDTO dto, 
		         @RequestParam("userId") Long userId,
		         @RequestPart(value = "images", required = false) List<MultipartFile> images
		 ) {
		     ReviewResponseDTO result = reviewService.reviewWrite(dto, userId, images);
		     return ResponseEntity.ok().body(result);
		 }

	    // r-all
	    @GetMapping
	    public ResponseEntity<?> reviewFindAll(
	    		@RequestParam(name = "page",defaultValue = "0") int page,
	    		@RequestParam(name = "size",defaultValue = "10") int size,
	    		@RequestParam(name = "userId",required = false) Long userId
	    		) {
	        Page<ReviewResponseDTO> result = reviewService.reviewFindAll(page,size,userId);
	        return ResponseEntity.ok().body(result);
	    }

	    // r-detail
	    @GetMapping("/{reviewId}")
	    public ResponseEntity<?> reviewFindOne(@PathVariable(name = "reviewId") Long reviewId, @RequestParam(name = "userId",required = false) Long userId) {
	        ReviewResponseDTO result = reviewService.reviewFindOne(reviewId, userId);
	        return ResponseEntity.ok().body(result);
	    }

	    // u
	    @PutMapping
	    public ResponseEntity<?> reviewUpdate(@RequestBody ReviewRequestDTO dto, @RequestParam(name = "userId") Long userId) {
	        ReviewResponseDTO result = reviewService.reviewUpdate(dto, userId);
	        return ResponseEntity.ok().body(result);
	    }

	    // d
	    @DeleteMapping("/{reviewId}")
	    public ResponseEntity<?> reviewDelete(@PathVariable(name = "reviewId") Long reviewId, @RequestParam(name = "userId") Long userId) {
	        boolean result = reviewService.reviewDelete(reviewId, userId);
	        return ResponseEntity.ok().body(result);
	    }

	    // like
	    @PostMapping("/{reviewId}/like")
	    public ResponseEntity<?> likeToggle(@PathVariable("reviewId") Long reviewId, @RequestParam(name = "userId") Long userId) {
	        ReviewResponseDTO result = reviewService.likeToggle(reviewId, userId);
	        return ResponseEntity.ok().body(result);
	    }

	    ////////////////////////////////////////////////////////////////////////////////////////////////////////

	    // 댓글 작성
	    @PostMapping("/comment")
	    public ResponseEntity<ReviewCommentResponseDTO> commentWrite(@RequestBody ReviewCommentRequestDTO requestDTO) {
	        return ResponseEntity.ok(reviewService.commentWrite(requestDTO));
	    }

	    // 댓글 수정
	    @PutMapping("/comment/{id}")
	    public ResponseEntity<ReviewCommentResponseDTO> commentUpdate(
	            @PathVariable(name = "id") Long id,
	            @RequestBody ReviewCommentRequestDTO requestDTO) {
	        return ResponseEntity.ok(reviewService.commentUpdate(id, requestDTO));
	    }

	    // 댓글 삭제
	    @DeleteMapping("/comment/{id}")
	    public ResponseEntity<Void> commentDelete(@PathVariable(name = "id") Long id) {
	        reviewService.commentDelete(id);
	        return ResponseEntity.noContent().build();
	    }

	    // 단일 댓글 조회
	    @GetMapping("/comment/all/{id}")
	    public ResponseEntity<ReviewCommentResponseDTO> commentFindOne(@PathVariable(name = "id") Long id) {
	        return ResponseEntity.ok(reviewService.commentFindOne(id));
	    }

	    // 리뷰 댓글 전체 조회
	    @GetMapping("/comment/{reviewId}")
	    public ResponseEntity<List<ReviewCommentResponseDTO>> commentFindAll(@PathVariable(name = "reviewId") Long reviewId) {
	        return ResponseEntity.ok(reviewService.commentFindAll(reviewId));
	    }
}
