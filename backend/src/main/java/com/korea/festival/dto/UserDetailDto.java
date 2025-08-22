package com.korea.festival.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.korea.festival.entity.User;

@Data
public class UserDetailDto {
    private Long userId;
    private String username;
    private String email;
    private String nickname;
    private String phoneNumber;
    private LocalDate birthDate;
    private String gender;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private Boolean isActive;
    
    public UserDetailDto(User user) {
        this.userId = user.getUserId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.phoneNumber = user.getPhoneNumber();
        this.birthDate = user.getBirthDate();
        this.createdAt = user.getCreatedAt();
        this.lastLogin = user.getLastLogin();
        this.isActive = user.getIsActive();
    }
}
