package com.korea.festival.dto;

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
public class ReviewRequestDTO {
	
	private Long id;
	private String location;
	private String title;
	private String date;
	private String content;
	private Set<String> tags;
	private List<String> images;
	

}
