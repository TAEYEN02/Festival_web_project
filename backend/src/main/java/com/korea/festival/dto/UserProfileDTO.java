package com.korea.festival.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileDTO {
    private Long id;
    private String username;
    private String nickname;
    private String email;
    private String profileImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}