package com.korea.festival.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BoardRequestDTO {
	
	private String category;
	private String title;
	private String content;
	private List<String> tags;

}
