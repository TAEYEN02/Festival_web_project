package com.korea.festival.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.korea.festival.entity.FestivalImageEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 페인페이지에서 쓰일 축제 정보 DTO
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class FestivalDTO_MainPage {
	
	private Long id;
    private String contentId;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    private String firstimage; // 대표 이미지
    private String description;
    private String bookingUrl;
    private int views;
    private int likesCount;
    private int clicks;
    private LocalDateTime createdAt;

    // 추가 이미지
    private List<FestivalImageDTO> images;

    // 후기
    private List<CommunityPostDTO> posts;

}
