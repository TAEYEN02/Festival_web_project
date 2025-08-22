package com.korea.festival.service;

import java.util.Base64;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.korea.festival.oauth.OAuthUserInfo;

@Service
public class OAuthService {
    
    private final WebClient webClient = WebClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public OAuthUserInfo getKakaoUserInfo(String accessToken) {
        try {
            Map<String, Object> response = webClient.get()
                .uri("https://kapi.kakao.com/v2/user/me")
                .headers(headers -> headers.setBearerAuth(accessToken))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
                
            System.out.println("카카오 API 응답: " + response); // 디버깅용
            
            String userId = response.get("id").toString();
            Map<String, Object> kakaoAccount = (Map<String, Object>) response.get("kakao_account");
            
            // 닉네임 처리
            String nickname = "카카오사용자_" + userId; // 기본값
            if (kakaoAccount != null) {
                Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
                if (profile != null && profile.get("nickname") != null) {
                    nickname = (String) profile.get("nickname");
                }
            }
            
            // 이메일은 항상 임시 이메일 사용 (개발 환경에서는 이메일 권한 없음)
            String email = "kakao_" + userId + "@temp.local";
            
            System.out.println("카카오 로그인 성공 - 사용자ID: " + userId + ", 닉네임: " + nickname + ", 임시이메일: " + email);
            
            return new OAuthUserInfo(
                "KAKAO",
                userId,
                email,
                nickname
            );
            
        } catch (Exception e) {
            System.err.println("카카오 사용자 정보 조회 실패: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("카카오 사용자 정보를 가져올 수 없습니다.", e);
        }
    }
    
    // 기존 방식 (access token 사용) - 호환성을 위해 유지
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
    
    // 새로운 방식 (Google Identity Services JWT 토큰 사용)
    public OAuthUserInfo getGoogleUserInfoFromIdToken(String idToken) {
        try {
            // JWT 토큰의 payload 부분 디코딩
            String[] chunks = idToken.split("\\.");
            Base64.Decoder decoder = Base64.getUrlDecoder();
            
            String payload = new String(decoder.decode(chunks[1]));
            JsonNode jsonNode = objectMapper.readTree(payload);
            
            return new OAuthUserInfo(
                "GOOGLE",
                jsonNode.get("sub").asText(), // Google user ID
                jsonNode.get("email").asText(),
                jsonNode.get("name").asText()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to decode Google ID token", e);
        }
    }
}