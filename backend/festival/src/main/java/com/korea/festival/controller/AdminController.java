package com.korea.festival.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.korea.festival.dto.AdminDashboardDTO;
import com.korea.festival.dto.AdminInquiryDTO;
import com.korea.festival.dto.AdminUserDTO;
import com.korea.festival.dto.InquiryAnswerDTO;
import com.korea.festival.dto.RegionalChatStatsDTO;
import com.korea.festival.dto.UserGrowthDTO;
import com.korea.festival.entity.InquiryStatus;
import com.korea.festival.service.AdminService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    
    // ===== 대시보드 =====
    
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        AdminDashboardDTO dashboard = adminService.getDashboardStats();
        return ResponseEntity.ok(dashboard);
    }
    
    // ===== 사용자 관리 =====
    
    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserDTO>> getUsers(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(name = "isActive", required = false) Boolean isActive) {  
        Page<AdminUserDTO> users = adminService.getUsers(pageable, isActive);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/users/{userId}")
    public ResponseEntity<AdminUserDTO> getUserDetail(@PathVariable Long userId) {
        AdminUserDTO user = adminService.getUserDetail(userId);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<Void> toggleUserStatus(@PathVariable Long userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok().build();
    }
    
    // ===== 문의 관리 =====
    
    @GetMapping("/inquiries")
    public ResponseEntity<Page<AdminInquiryDTO>> getInquiries(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(name = "status", required = false) InquiryStatus status) {  
        Page<AdminInquiryDTO> inquiries = adminService.getInquiries(pageable, status);
        return ResponseEntity.ok(inquiries);
    }
    
    @GetMapping("/inquiries/{inquiryId}")
    public ResponseEntity<AdminInquiryDTO> getInquiry(@PathVariable(name="inquiryId") Long inquiryId) {
        AdminInquiryDTO inquiry = adminService.getInquiry(inquiryId);
        return ResponseEntity.ok(inquiry);
    }
    
    @PostMapping("/inquiries/{inquiryId}/answer")
    public ResponseEntity<AdminInquiryDTO> answerInquiry(
            @PathVariable(name="inquiryId") Long inquiryId,
            @Valid @RequestBody InquiryAnswerDTO answerDTO) {
        AdminInquiryDTO answered = adminService.answerInquiry(inquiryId, answerDTO);
        return ResponseEntity.ok(answered);
    }
    
    // ===== 통계 =====
    
    @GetMapping("/stats/user-growth")
    public ResponseEntity<List<UserGrowthDTO>> getUserGrowthStats(
            @RequestParam(name = "days", defaultValue = "30") int days) {  
        List<UserGrowthDTO> stats = adminService.getUserGrowthStats(days);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/stats/regional-chat")
    public ResponseEntity<List<RegionalChatStatsDTO>> getRegionalChatStats() {
        List<RegionalChatStatsDTO> stats = adminService.getRegionalChatStats();
        return ResponseEntity.ok(stats);
    }
}