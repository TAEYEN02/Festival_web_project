package com.korea.festival.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewCommentRequestDTO {
	private Long reviewId;
	private Long userId;
	private String content;
	private Long parentId;

}
