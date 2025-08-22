package com.korea.festival.controller;

import com.korea.festival.dto.*;
import com.korea.festival.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // 사용자 목록 조회
    @GetMapping("/users")
    public ResponseEntity<Page<UserDto>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search) {

        Page<UserDto> users = adminService.getUsers(page, size, sortBy, sortDir, search);
        return ResponseEntity.ok(users);
    }

    // 사용자 상세 조회
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDetailDto> getUserDetail(@PathVariable(name="userId") Long userId) {
        UserDetailDto userDetail = adminService.getUserDetail(userId);
        return ResponseEntity.ok(userDetail);
    }

    // 사용자 활성/비활성화
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<Void> toggleUserStatus(@PathVariable(name="userId") Long userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok().build();
    }

    // 문의 목록 조회
    @GetMapping("/inquiries")
    public ResponseEntity<Page<InquiryDto>> getInquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {

        Page<InquiryDto> inquiries = adminService.getInquiries(page, size, status);
        return ResponseEntity.ok(inquiries);
    }

    // 문의 답변
    @PostMapping("/inquiries/{inquiryId}/response")
    public ResponseEntity<Void> respondToInquiry(
            @PathVariable(name="inquiryId") Long inquiryId,
            @RequestBody InquiryResponseDto responseDto,
            Principal principal) {

        adminService.respondToInquiry(inquiryId, responseDto, principal.getName());
        return ResponseEntity.ok().build();
    }

    // 대시보드 통계
    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardDto> getDashboardStats() {
        AdminDashboardDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}
