package com.korea.festival.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

//축제 후기 DTO
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
