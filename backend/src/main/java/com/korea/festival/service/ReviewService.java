package com.korea.festival.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.korea.festival.dto.ReviewCommentRequestDTO;
import com.korea.festival.dto.ReviewCommentResponseDTO;
import com.korea.festival.dto.ReviewRequestDTO;
import com.korea.festival.dto.ReviewResponseDTO;
import com.korea.festival.entity.Review;
import com.korea.festival.entity.ReviewComment;
import com.korea.festival.entity.ReviewLikes;
import com.korea.festival.entity.User;
import com.korea.festival.repository.ReviewCommentRepository;
import com.korea.festival.repository.ReviewLikesRepository;
import com.korea.festival.repository.ReviewRepository;
import com.korea.festival.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

	 private final ReviewCommentRepository commentRepository;
	    private final ReviewRepository reviewRepository;
	    private final ReviewLikesRepository reviewLikesRepository;
	    private final UserRepository userRepository;

	    // c
	    public ReviewResponseDTO reviewWrite(ReviewRequestDTO dto, Long userId) {
	        User user = userRepository.findById(userId)
	                .orElseThrow(() -> new RuntimeException("사용자 없음"));

	        Review newReview = Review.builder()
	                .title(dto.getTitle())
	                .content(dto.getContent())
	                .location(dto.getLocation())
	                .tags(dto.getTags())
	                .user(user)
	                .likes(0)
	                .createdAt(LocalDateTime.now())
	                .updatedAt(LocalDateTime.now())
	                .build();

	        reviewRepository.save(newReview);
	        return toDTO(newReview, userId);
	    }

	    // r-all
	    public List<ReviewResponseDTO> reviewFindAll(Long userId) {
	        List<Review> reviews = reviewRepository.findAll();

	        return reviews.stream()
	                .map(review -> toDTO(review, userId))
	                .toList();
	    }

	    // r-detail
	    @Transactional
	    public ReviewResponseDTO reviewFindOne(Long reviewId, Long userId) {
	        Review review = reviewRepository.findById(reviewId)
	                .orElseThrow(() -> new RuntimeException("리뷰 없음"));
	        return toDTO(review, userId);
	    }

	    // u
	    public ReviewResponseDTO reviewUpdate(ReviewRequestDTO dto, Long userId) {
	        Review review = reviewRepository.findById(dto.getId())
	                .orElseThrow(() -> new RuntimeException("리뷰 없음"));

	        if (!review.getUser().getId().equals(userId)) {
	            throw new RuntimeException("작성자가 아닙니다.");
	        }

	        review.setTitle(dto.getTitle());
	        review.setContent(dto.getContent());
	        review.setLocation(dto.getLocation());
	        review.setTags(dto.getTags());
	        review.setUpdatedAt(LocalDateTime.now());
	        reviewRepository.save(review);

	        return toDTO(review, userId);
	    }

	    // d
	    public boolean reviewDelete(Long reviewId, Long userId) {
	        userRepository.findById(userId)
	                .orElseThrow(() -> new RuntimeException("유저 없음"));

	        Review review = reviewRepository.findById(reviewId)
	                .orElseThrow(() -> new RuntimeException("리뷰 없음"));

	        if (!review.getUser().getId().equals(userId)) {
	            throw new RuntimeException("작성자가 아닙니다.");
	        }

	        if (!reviewRepository.existsById(reviewId)) {
	            return false;
	        }

	        reviewRepository.deleteById(reviewId);
	        return !reviewRepository.existsById(reviewId);
	    }

	    // like toggle
	    @Transactional
	    public ReviewResponseDTO likeToggle(Long reviewId, Long userId) {
	        Review review = reviewRepository.findById(reviewId)
	                .orElseThrow(() -> new RuntimeException("리뷰 없음"));
	        User user = userRepository.findById(userId)
	                .orElseThrow(() -> new RuntimeException("사용자 없음"));

	        reviewLikesRepository.findByReviewIdAndUserId(reviewId, userId).ifPresentOrElse(
	                exist -> {
	                    reviewLikesRepository.delete(exist);
	                    review.setLikes(review.getLikes() - 1);
	                },
	                () -> {
	                    ReviewLikes newLike = new ReviewLikes();
	                    newLike.setReview(review);
	                    newLike.setUser(user);
	                    reviewLikesRepository.save(newLike);
	                    review.setLikes(review.getLikes() + 1);
	                }
	        );

	        return toDTO(review, userId);
	    }

	    // toDTO
	    private ReviewResponseDTO toDTO(Review review, Long currentUserId) {
	        boolean liked = false;
	        if (currentUserId != null) {
	            liked = reviewLikesRepository.existsByReviewIdAndUserId(review.getId(), currentUserId);
	        }

	        return ReviewResponseDTO.builder()
	                .id(review.getId())
	                .title(review.getTitle())
	                .content(review.getContent())
	                .location(review.getLocation())
	                .likes(review.getLikes())
	                .likedByCurrentUser(liked)
	                .authorNickname(review.getUser().getNickname())
	                .tags(review.getTags())
	                .createdAt(review.getCreatedAt())
	                .updatedAt(review.getUpdatedAt())
	                .build();
	    }

	    ///////////////////////////////////////////////////////////////////////

	    // 댓글 작성
	    public ReviewCommentResponseDTO commentWrite(ReviewCommentRequestDTO requestDTO) {
	        Review review = reviewRepository.findById(requestDTO.getReviewId())
	                .orElseThrow(() -> new RuntimeException("리뷰 없음"));

	        User user = userRepository.findById(requestDTO.getUserId())
	                .orElseThrow(() -> new RuntimeException("사용자 없음"));

	        ReviewComment parent = null;
	        if (requestDTO.getParentId() != null) {
	            parent = commentRepository.findById(requestDTO.getParentId())
	                    .orElseThrow(() -> new RuntimeException("부모 댓글 없음"));
	        }

	        ReviewComment comment = ReviewComment.builder()
	                .review(review)
	                .user(user)
	                .content(requestDTO.getContent())
	                .parent(parent)
	                .build();

	        ReviewComment saved = commentRepository.save(comment);
	        return toDTO(saved);
	    }

	    // 댓글 수정
	    public ReviewCommentResponseDTO commentUpdate(Long commentId, ReviewCommentRequestDTO requestDTO) {
	        ReviewComment comment = commentRepository.findById(commentId)
	                .orElseThrow(() -> new RuntimeException("댓글 없음"));

	        comment.setContent(requestDTO.getContent());
	        ReviewComment updated = commentRepository.save(comment);
	        return toDTO(updated);
	    }

	    // 댓글 삭제
	    public void commentDelete(Long commentId) {
	        commentRepository.deleteById(commentId);
	    }

	    // 단일 댓글 조회
	    public ReviewCommentResponseDTO commentFindOne(Long commentId) {
	        ReviewComment comment = commentRepository.findById(commentId)
	                .orElseThrow(() -> new RuntimeException("댓글 없음"));
	        return toDTO(comment);
	    }

	    // 리뷰 댓글 전체 조회
	    public List<ReviewCommentResponseDTO> commentFindAll(Long reviewId) {
	        List<ReviewComment> comments = commentRepository.findByReviewIdAndParentIsNull(reviewId);
	        return comments.stream().map(this::toDTO).collect(Collectors.toList());
	    }

	    // 댓글 DTO 변환 (재귀)
	    private ReviewCommentResponseDTO toDTO(ReviewComment comment) {
	        ReviewCommentResponseDTO dto = ReviewCommentResponseDTO.builder()
	                .id(comment.getId())
	                .userId(comment.getUser().getId())
	                .userNickname(comment.getUser().getNickname())
	                .content(comment.getContent())
	                .createdAt(comment.getCreatedAt())
	                .build();

	        dto.setReplies(
	                comment.getReplies().stream()
	                        .map(this::toDTO)
	                        .collect(Collectors.toList())
	        );

	        return dto;
	    }
}


