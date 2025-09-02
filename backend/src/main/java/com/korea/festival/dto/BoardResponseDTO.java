package com.korea.festival.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BoardResponseDTO {

	private Long id;
	private String title;
	private String content;
	private String category;
	
	private int likes;
	private int view;
	private boolean likedByCurrentUser;
	
	private String authorNickname;
	private List<String> tags;
	
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private List<BoardCommentResponseDTO> comments;
	
}
