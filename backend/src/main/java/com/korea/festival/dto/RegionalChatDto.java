package com.korea.festival.dto;

import java.time.LocalDateTime;

import com.korea.festival.entity.RegionalChat;

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
    
    public RegionalChatDto(RegionalChat chat) {
        this.id = chat.getId();
        this.region = chat.getRegion();
        this.message = chat.getMessage(); // ✅ 올바른 필드명
        this.userNickname = chat.getUser() != null ? chat.getUser().getNickname() : "Unknown";
        this.createdAt = chat.getCreatedAt();
    }
}