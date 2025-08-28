package com.korea.festival.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


//축제 후기 사진 DTO
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class FestivalImageDTO {

	private Long id;
    private Long festivalId;
    private String imageUrl;
}
