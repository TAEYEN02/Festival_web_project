package com.korea.festival.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.korea.festival.dto.JwtAuthenticationResponse;
import com.korea.festival.dto.LoginRequest;
import com.korea.festival.dto.SignUpRequest;
import com.korea.festival.entity.User;
import com.korea.festival.jwt.JwtTokenProvider;
import com.korea.festival.oauth.OAuthUserInfo;
import com.korea.festival.service.OAuthService;
import com.korea.festival.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtTokenProvider tokenProvider;
    private final OAuthService oAuthService;

    @PostMapping("/signin")
    public ResponseEntity<JwtAuthenticationResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        String role = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .findFirst()
            .map(a -> a.startsWith("ROLE_") ? a : "ROLE_" + a)
            .orElse("ROLE_USER");

        JwtAuthenticationResponse response = new JwtAuthenticationResponse(jwt);
        response.setUsername(loginRequest.getUsername());
        response.setRole(role);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<String> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        try {
            userService.registerUser(signUpRequest);
            return ResponseEntity.ok("회원가입이 성공적으로 완료되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/oauth/kakao")
    public ResponseEntity<JwtAuthenticationResponse> kakaoLogin(@RequestBody Map<String, String> payload) {
        String accessToken = payload.get("accessToken");
        OAuthUserInfo userInfo = oAuthService.getKakaoUserInfo(accessToken);
        User user = userService.findOrCreateOAuthUser(userInfo, "KAKAO");

        Authentication authentication = userService.getAuthentication(user);
        String jwt = tokenProvider.generateToken(authentication);

        JwtAuthenticationResponse response = new JwtAuthenticationResponse(jwt);
        response.setUsername(user.getUsername());
        response.setRole(user.getRoles().iterator().next().getName().name());
        response.setNickname(user.getNickname());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/oauth/google")
    public ResponseEntity<JwtAuthenticationResponse> googleLogin(@RequestBody Map<String, String> payload) {
        String accessToken = payload.get("accessToken");
        OAuthUserInfo userInfo = oAuthService.getGoogleUserInfo(accessToken);
        User user = userService.findOrCreateOAuthUser(userInfo, "GOOGLE");

        Authentication authentication = userService.getAuthentication(user);
        String jwt = tokenProvider.generateToken(authentication);

        JwtAuthenticationResponse response = new JwtAuthenticationResponse(jwt);
        response.setUsername(user.getUsername());
        response.setRole(user.getRoles().iterator().next().getName().name());
        response.setNickname(user.getNickname());

        return ResponseEntity.ok(response);
    }
}
