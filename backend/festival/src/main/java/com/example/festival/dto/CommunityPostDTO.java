package com.example.festival.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class CommunityPostDTO {

	private Long id;
    private Long festivalId;
    private Long userId;
    private String userNickname;
    private String content;
    private LocalDateTime createdAt;
}
