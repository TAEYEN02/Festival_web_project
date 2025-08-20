package com.example.festival.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class FestivalImageDTO {

	private Long id;
    private Long festivalId;
    private String imageUrl;
}
