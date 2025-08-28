package com.korea.festival.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewCommentResponseDTO {
	private Long id;
	private Long userId;
	private String userNickname;
	private String content;
	private LocalDateTime createdAt;
	private List<ReviewCommentResponseDTO> replies = new ArrayList<ReviewCommentResponseDTO>();
}
