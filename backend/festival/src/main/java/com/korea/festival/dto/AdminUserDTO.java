package com.korea.festival.dto;

import java.time.LocalDateTime;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserDTO {
    private Long id;
    private String userId; // USR-2024-101 형태
    private String username;
    private String nickname;
    private String email;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Set<String> roles;
    private Long inquiryCount;
    private Long wishlistCount;
    private Long chatMessageCount;
}
