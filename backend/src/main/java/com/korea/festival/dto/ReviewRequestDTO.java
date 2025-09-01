package com.korea.festival.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewRequestDTO {
	
	private Long id;
	private String location;
	private String title;
	private String content;
	private List<String> tags;
	private List<String> images;
	

}
