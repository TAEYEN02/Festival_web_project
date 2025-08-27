package com.korea.festival.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BoardCommentRequestDTO {
	
	private Long boardId;
	private Long userId;
	private String content;
	private Long parentId;

}
