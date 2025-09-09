package com.korea.festival.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewResponseDTO {
	
	private Long id;
	private String title;
	private String content;
	private String location;
	private String date;
	
	private int likes;
	private int view;
	private boolean likedByCurrentUser;
	
	private String authorNickname;
	private Long userId;
	private String authorImg;
	
	private Set<String> tags;
	private Set<String> images;
	
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private List<ReviewCommentResponseDTO> comments;
	

}
