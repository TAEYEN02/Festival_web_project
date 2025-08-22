package com.korea.festival.dto;

import lombok.Data;

@Data
public class SignUpRequest {
    private String username;
    private String email;
    private String password;
    private String nickname;
    private String role; // USER / ADMIN
}
