package com.korea.festival.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.korea.festival.oauth.OAuthUserInfo;

@Service
public class OAuthService {

    private final WebClient webClient = WebClient.create();

    public OAuthUserInfo getKakaoUserInfo(String accessToken) {
        Map<String, Object> response = webClient.get()
            .uri("https://kapi.kakao.com/v2/user/me")
            .headers(headers -> headers.setBearerAuth(accessToken))
            .retrieve()
            .bodyToMono(Map.class)
            .block();

        Map<String, Object> kakaoAccount = (Map<String, Object>) response.get("kakao_account");

        return new OAuthUserInfo(
            "KAKAO",
            response.get("id").toString(),
            (String) kakaoAccount.get("email"),
            (String) ((Map<String, Object>) kakaoAccount.get("profile")).get("nickname")
        );
    }

    public OAuthUserInfo getGoogleUserInfo(String accessToken) {
        Map<String, Object> response = webClient.get()
            .uri("https://www.googleapis.com/oauth2/v2/userinfo")
            .headers(headers -> headers.setBearerAuth(accessToken))
            .retrieve()
            .bodyToMono(Map.class)
            .block();

        return new OAuthUserInfo(
            "GOOGLE",
            (String) response.get("id"),
            (String) response.get("email"),
            (String) response.get("name")
        );
    }
}