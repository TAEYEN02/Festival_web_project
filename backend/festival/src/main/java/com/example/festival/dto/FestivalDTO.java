package com.example.festival.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class FestivalDTO {
	
	private Long id;
    private String externalId;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    private String imageUrl; // 대표 이미지
    private String description;
    private String bookingUrl;
    private String homepage;
    private int views;
    private int clicks;
    private LocalDateTime createdAt;

    // 추가 이미지
    private List<FestivalImageDTO> images;

    // 후기
    private List<CommunityPostDTO> posts;
    
    
   
}
