package com.korea.festival.dto;

import java.time.LocalDateTime;
import java.util.Set;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserDetailDto {
    private Long id;
    private String username;
    private String nickname;
    private String email;
    private Set<String> roles;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 생성자 추가
    public UserDetailDto(Long id, String username, String nickname, String email, 
                        Set<String> roles, Boolean isActive, 
                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.username = username;
        this.nickname = nickname;
        this.email = email;
        this.roles = roles;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
