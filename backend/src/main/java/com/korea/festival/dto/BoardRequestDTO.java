package com.korea.festival.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor 
@Builder
public class BoardRequestDTO {
	
	private Long id;
	private String category;
	private String title;
	private String content;
	private List<String> tags;

}
