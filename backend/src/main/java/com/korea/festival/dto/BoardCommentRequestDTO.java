package com.korea.festival.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BoardCommentRequestDTO {
	
	private Long boardId;
	private Long userId;
	private String content;
	private Long parentId;

}
