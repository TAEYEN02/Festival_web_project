package com.korea.festival.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long userId;
    private String username;
    private String email;
    private String nickname;
    private String role;
}
