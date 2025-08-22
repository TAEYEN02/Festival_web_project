package com.korea.festival.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegionalChatDto {
    private Long id;
    
    @NotBlank(message = "지역은 필수입니다")
    private String region;
    
    @NotBlank(message = "메시지는 필수입니다")
    private String message;
    
    private String userNickname;
    private LocalDateTime createdAt;
}