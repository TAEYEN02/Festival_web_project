package com.korea.festival.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
				new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

		SecurityContextHolder.getContext().setAuthentication(authentication);
		String jwt = tokenProvider.generateToken(authentication);

		String role = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).findFirst()
				.map(a -> a.startsWith("ROLE_") ? a : "ROLE_" + a).orElse("ROLE_USER");
		
		Long userId = userService.getUserProfile(loginRequest.getUsername()).getId();

		JwtAuthenticationResponse response = new JwtAuthenticationResponse(jwt);
		response.setUsername(loginRequest.getUsername());
		response.setUserId(userId);
		response.setRole(role);

		return ResponseEntity.ok(response);
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
		OAuthUserInfo userInfo;

		// 새로운 방식 (idToken) 또는 기존 방식 (accessToken) 지원
		if (payload.containsKey("idToken")) {
			String idToken = payload.get("idToken");
			userInfo = oAuthService.getGoogleUserInfoFromIdToken(idToken);
		} else if (payload.containsKey("accessToken")) {
			String accessToken = payload.get("accessToken");
			userInfo = oAuthService.getGoogleUserInfo(accessToken);
		} else {
			return ResponseEntity.badRequest().body(null);
		}

		User user = userService.findOrCreateOAuthUser(userInfo, "GOOGLE");

		Authentication authentication = userService.getAuthentication(user);
		String jwt = tokenProvider.generateToken(authentication);

		JwtAuthenticationResponse response = new JwtAuthenticationResponse(jwt);
		response.setUsername(user.getUsername());
		response.setRole(user.getRoles().iterator().next().getName().name());
		response.setNickname(user.getNickname());

		return ResponseEntity.ok(response);
	}

	// 회원가입 엔드포인트 (기존 auth.js와 호환)
	@PostMapping("/signup")
	public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
		try {
			User user = userService.registerUser(signUpRequest);

			Map<String, Object> response = new HashMap<>();
			response.put("success", true);
			response.put("message", "회원가입이 완료되었습니다.");
			response.put("userId", user.getId());

			return ResponseEntity.ok(response);
		} catch (RuntimeException e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("success", false);
			errorResponse.put("error", e.getMessage());

			return ResponseEntity.badRequest().body(errorResponse);
		}
	}

	// 추가: register 엔드포인트도 유지 (호환성)
	@PostMapping("/register")
	public ResponseEntity<?> register(@Valid @RequestBody SignUpRequest signUpRequest) {
		return registerUser(signUpRequest);
	}

	// 중복 확인 엔드포인트 (파라미터 이름 명시적 지정)
	@GetMapping("/check-duplicate")
	public ResponseEntity<?> checkDuplicate(
			@RequestParam(name = "field", required = true) String field, 
			@RequestParam(name = "value", required = true) String value) {

		try {
			// 입력값 검증
			if (field == null || field.trim().isEmpty()) {
				Map<String, Object> errorResponse = new HashMap<>();
				errorResponse.put("success", false);
				errorResponse.put("error", "필드명을 입력해주세요");
				return ResponseEntity.badRequest().body(errorResponse);
			}

			if (value == null || value.trim().isEmpty()) {
				Map<String, Object> errorResponse = new HashMap<>();
				errorResponse.put("success", false);
				errorResponse.put("error", "확인할 값을 입력해주세요");
				return ResponseEntity.badRequest().body(errorResponse);
			}

			boolean isDuplicate = false;
			String message = "";

			switch (field.toLowerCase()) {
			case "username":
				isDuplicate = userService.existsByUsername(value);
				message = isDuplicate ? "이미 사용중인 사용자명입니다" : "사용 가능한 사용자명입니다";
				break;
			case "nickname":
				isDuplicate = userService.existsByNickname(value);
				message = isDuplicate ? "이미 사용중인 닉네임입니다" : "사용 가능한 닉네임입니다";
				break;
			case "email":
				isDuplicate = userService.existsByEmail(value);
				message = isDuplicate ? "이미 사용중인 이메일입니다" : "사용 가능한 이메일입니다";
				break;
			default:
				Map<String, Object> errorResponse = new HashMap<>();
				errorResponse.put("success", false);
				errorResponse.put("error", "잘못된 필드명입니다. username, nickname, email만 지원됩니다.");
				return ResponseEntity.badRequest().body(errorResponse);
			}

			Map<String, Object> response = new HashMap<>();
			response.put("success", true);
			response.put("available", !isDuplicate);
			response.put("message", message);
			response.put("field", field);
			response.put("value", value);

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			e.printStackTrace(); // 로그 출력으로 디버깅
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("success", false);
			errorResponse.put("error", "중복 확인 중 오류가 발생했습니다: " + e.getMessage());

			return ResponseEntity.internalServerError().body(errorResponse);
		}
	}

	// 아이디 찾기 (이메일로)
	@PostMapping("/find-username")
	public ResponseEntity<?> findUsername(@RequestBody Map<String, String> request) {
		try {
			String email = request.get("email");
			
			if (email == null || email.trim().isEmpty()) {
				Map<String, Object> errorResponse = new HashMap<>();
				errorResponse.put("success", false);
				errorResponse.put("error", "이메일을 입력해주세요");
				return ResponseEntity.badRequest().body(errorResponse);
			}

			String username = userService.findUsernameByEmail(email);
			
			Map<String, Object> response = new HashMap<>();
			response.put("success", true);
			response.put("username", username);
			response.put("message", "아이디를 찾았습니다");
			
			return ResponseEntity.ok(response);
			
		} catch (RuntimeException e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("success", false);
			errorResponse.put("error", e.getMessage());
			return ResponseEntity.badRequest().body(errorResponse);
		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("success", false);
			errorResponse.put("error", "아이디 찾기 중 오류가 발생했습니다");
			return ResponseEntity.internalServerError().body(errorResponse);
		}
	}

	// 비밀번호 재설정 (임시 비밀번호 이메일 발송)
	@PostMapping("/reset-password")
	public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
		try {
			String username = request.get("username");
			String email = request.get("email");
			
			if (username == null || username.trim().isEmpty()) {
				Map<String, Object> errorResponse = new HashMap<>();
				errorResponse.put("success", false);
				errorResponse.put("error", "아이디를 입력해주세요");
				return ResponseEntity.badRequest().body(errorResponse);
			}
			
			if (email == null || email.trim().isEmpty()) {
				Map<String, Object> errorResponse = new HashMap<>();
				errorResponse.put("success", false);
				errorResponse.put("error", "이메일을 입력해주세요");
				return ResponseEntity.badRequest().body(errorResponse);
			}

			userService.resetPassword(username, email);
			
			Map<String, Object> response = new HashMap<>();
			response.put("success", true);
			response.put("message", "임시 비밀번호가 이메일로 발송되었습니다. 이메일을 확인한 후 로그인해주세요.");
			
			return ResponseEntity.ok(response);
			
		} catch (RuntimeException e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("success", false);
			errorResponse.put("error", e.getMessage());
			return ResponseEntity.badRequest().body(errorResponse);
		} catch (Exception e) {
			e.printStackTrace();
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("success", false);
			errorResponse.put("error", "비밀번호 재설정 중 오류가 발생했습니다");
			return ResponseEntity.internalServerError().body(errorResponse);
		}
	}
}