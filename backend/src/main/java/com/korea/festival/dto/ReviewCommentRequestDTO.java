package com.korea.festival.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewCommentRequestDTO {
	private Long reviewId;
	private Long userId;
	private String content;
	private Long parentId;

}
