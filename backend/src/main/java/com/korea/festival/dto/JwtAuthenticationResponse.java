package com.korea.festival.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JwtAuthenticationResponse {
	private Long userId;
    private String accessToken;
    private String tokenType = "Bearer";
    private String username;
    private String role;
    private String nickname;
    
    // 기본 생성자 + 토큰만 설정하는 생성자
    public JwtAuthenticationResponse(String accessToken) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
    }
    
    // 전체 정보를 받는 생성자
    public JwtAuthenticationResponse(String accessToken, String username, String role) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.username = username;
        this.role = role;
        this.nickname = nickname;
    }

}