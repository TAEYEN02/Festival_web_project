package com.korea.festival.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BoardResponseDTO {

	private Long id;
	private String title;
	private String content;
	private String category;
	
	private int likes;
	private boolean likedByCurrentUser;
	
	private String authorNickname;
	private List<String> tags;
	
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	
}
