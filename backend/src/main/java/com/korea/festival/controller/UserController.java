package com.korea.festival.controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.korea.festival.dto.UserProfileDTO;
import com.korea.festival.dto.UserUpdateDto;
import com.korea.festival.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCurrentUserInfo(Principal principal) {
        try {
            String username = principal.getName();
            UserProfileDTO profile = userService.getUserProfile(username);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateUserInfo(@Valid @RequestBody UserUpdateDto updateDto, Principal principal) {
        try {
            String username = principal.getName();
            UserProfileDTO updatedProfile = userService.updateUserProfile(username, updateDto);
            return ResponseEntity.ok(updatedProfile);
        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ===== 비밀번호 변경 엔드포인트 =====
    @PutMapping("/change-password")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request, Principal principal) {
        try {
            System.out.println("=== 비밀번호 변경 요청 시작 ===");
            System.out.println("사용자: " + principal.getName());
            System.out.println("요청 데이터: " + request);
            
            String username = principal.getName();
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            if (currentPassword == null || currentPassword.isEmpty()) {
                throw new RuntimeException("현재 비밀번호를 입력해주세요");
            }
            
            if (newPassword == null || newPassword.isEmpty()) {
                throw new RuntimeException("새 비밀번호를 입력해주세요");
            }
            
            if (newPassword.length() < 8) {
                throw new RuntimeException("새 비밀번호는 8자 이상이어야 합니다");
            }
            
            System.out.println("UserService.changePassword 호출 중...");
            userService.changePassword(username, currentPassword, newPassword);
            System.out.println("비밀번호 변경 성공!");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "비밀번호가 성공적으로 변경되었습니다");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.err.println("비밀번호 변경 실패: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
            
        } catch (Exception e) {
            System.err.println("예상치 못한 오류: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "비밀번호 변경 중 오류가 발생했습니다");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    // 테스트용 엔드포인트
    @GetMapping("/test")
    public ResponseEntity<?> test(Principal principal) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "UserController가 정상 작동합니다");
        response.put("username", principal != null ? principal.getName() : "인증되지 않음");
        return ResponseEntity.ok(response);
    }
}