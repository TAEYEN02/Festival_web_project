package com.korea.festival.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
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

    // 리뷰 작성
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

 // 단건 조회
    @Transactional
    public ReviewResponseDTO reviewFindOne(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId) // findById() 그대로 사용
                .orElseThrow(() -> new RuntimeException("리뷰 없음"));
        return toDTO(review, userId);
    }

    // 전체 조회
    @Transactional
    public List<ReviewResponseDTO> reviewFindAll(Long userId) {
        List<Review> reviews = reviewRepository.findAll(); // findAll() 그대로 사용
        return reviews.stream()
                .map(review -> toDTO(review, userId))
                .collect(Collectors.toList());
    }



    // 리뷰 수정
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

    // 리뷰 삭제
    public boolean reviewDelete(Long reviewId, Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰 없음"));

        if (!review.getUser().getId().equals(userId)) {
            throw new RuntimeException("작성자가 아닙니다.");
        }

        reviewRepository.delete(review);
        return !reviewRepository.existsById(reviewId);
    }

    // 좋아요 토글
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

    // 리뷰 → DTO 변환
    private ReviewResponseDTO toDTO(Review review, Long currentUserId) {
        boolean liked = currentUserId != null &&
                        reviewLikesRepository.existsByReviewIdAndUserId(review.getId(), currentUserId);

        List<ReviewCommentResponseDTO> commentDTOs = review.getComments().stream()
                .map(this::toDTO) // 재귀적 변환
                .collect(Collectors.toList());

        return ReviewResponseDTO.builder()
                .id(review.getId())
                .title(review.getTitle())
                .content(review.getContent())
                .location(review.getLocation())
                .authorImg(review.getUser().getProfileImage())
                .likes(review.getLikes())
                .view(review.getView())
                .likedByCurrentUser(liked)
                .authorNickname(review.getUser().getNickname())
                .tags(review.getTags())
                .date(review.getDate())
                .images(review.getImages())
                .comments(commentDTOs)
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

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

    // 리뷰 댓글 전체 조회 (최상위 + 대댓글)
    public List<ReviewCommentResponseDTO> commentFindAll(Long reviewId) {
        List<ReviewComment> comments = commentRepository.findByReviewIdAndParentIsNull(reviewId);
        return comments.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // 댓글 DTO 변환 (재귀)
    private ReviewCommentResponseDTO toDTO(ReviewComment comment) {
        ReviewCommentResponseDTO dto = ReviewCommentResponseDTO.builder()
                .id(comment.getId())
                .userId(comment.getUser() != null ? comment.getUser().getId() : null)
                .userNickname(comment.getUser() != null ? comment.getUser().getNickname() : null)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .replies(new ArrayList<>()) // 빈 리스트로 초기화
                .build();

        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            List<ReviewCommentResponseDTO> replyDTOs = comment.getReplies().stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
            dto.setReplies(replyDTOs);
        }

        return dto;
    }
}
