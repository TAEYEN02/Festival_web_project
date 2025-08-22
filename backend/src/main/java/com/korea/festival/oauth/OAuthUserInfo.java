package com.korea.festival.oauth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OAuthUserInfo {
    private String provider; // KAKAO, GOOGLE
    private String providerId; // 카카오/구글 고유 ID
    private String email;
    private String nickname;
}
