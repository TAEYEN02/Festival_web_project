package com.korea.festival.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminController {
    
    private final AdminService adminService;
    
    // ===== 대시보드 =====
    
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        try {
            AdminDashboardDTO dashboard = adminService.getDashboardStats();
            log.info("Dashboard stats retrieved successfully");
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            log.error("Error retrieving dashboard stats", e);
            throw e;
        }
    }
    
    // ===== 사용자 관리 =====
    
    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserDTO>> getUsers(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(name = "isActive", required = false) Boolean isActive,
            @RequestParam(name = "search", required = false) String search) {
        
        try {
            // 검색어 로깅
            if (search != null && !search.trim().isEmpty()) {
                log.info("Searching users with keyword: {}", search);
            }
            
            Page<AdminUserDTO> users = adminService.getUsers(pageable, isActive, search);
            
            log.info("Retrieved {} users (page: {}, size: {}, isActive: {}, search: '{}')", 
                    users.getTotalElements(), pageable.getPageNumber(), pageable.getPageSize(), 
                    isActive, search != null ? search : "");
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error retrieving users with params - isActive: {}, search: '{}'", isActive, search, e);
            throw e;
        }
    }
    
    @GetMapping("/users/{userId}")
    public ResponseEntity<AdminUserDTO> getUserDetail(@PathVariable("userId") Long userId) {
        try {
            AdminUserDTO user = adminService.getUserDetail(userId);
            log.info("Retrieved user detail for ID: {}", userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            log.error("Error retrieving user detail for ID: {}", userId, e);
            throw e;
        }
    }
    
    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<Void> toggleUserStatus(@PathVariable("userId") Long userId) {
        try {
            adminService.toggleUserStatus(userId);
            log.info("Toggled status for user ID: {}", userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error toggling user status for ID: {}", userId, e);
            throw e;
        }
    }
    
    // ===== 문의 관리 =====
    
    @GetMapping("/inquiries")
    public ResponseEntity<Page<AdminInquiryDTO>> getInquiries(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "search", required = false) String search) {
        
        try {
            InquiryStatus inquiryStatus = null;
            
            if (status != null && !status.equals("all") && !status.isEmpty()) {
                try {
                    inquiryStatus = InquiryStatus.valueOf(status.toUpperCase());
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid inquiry status: {}", status);
                }
            }
            
            // 검색어 로깅
            if (search != null && !search.trim().isEmpty()) {
                log.info("Searching inquiries with keyword: {}", search);
            }
            
            Page<AdminInquiryDTO> inquiries = adminService.getInquiries(pageable, inquiryStatus, search);
            log.info("Retrieved {} inquiries (page: {}, size: {}, status: {}, search: '{}')", 
                inquiries.getTotalElements(), pageable.getPageNumber(), pageable.getPageSize(), 
                status, search != null ? search : "");
            return ResponseEntity.ok(inquiries);
        } catch (Exception e) {
            log.error("Error retrieving inquiries with params - status: {}, search: '{}'", status, search, e);
            throw e;
        }
    }
    
    @GetMapping("/inquiries/{inquiryId}")
    public ResponseEntity<AdminInquiryDTO> getInquiry(@PathVariable("inquiryId") Long inquiryId) {
        try {
            AdminInquiryDTO inquiry = adminService.getInquiry(inquiryId);
            log.info("Retrieved inquiry detail for ID: {}", inquiryId);
            return ResponseEntity.ok(inquiry);
        } catch (Exception e) {
            log.error("Error retrieving inquiry detail for ID: {}", inquiryId, e);
            throw e;
        }
    }
    
    @PostMapping("/inquiries/{inquiryId}/answer")
    public ResponseEntity<AdminInquiryDTO> answerInquiry(
            @PathVariable("inquiryId") Long inquiryId,
            @Valid @RequestBody InquiryAnswerDTO answerDTO) {
        try {
            AdminInquiryDTO answered = adminService.answerInquiry(inquiryId, answerDTO);
            log.info("Answered inquiry ID: {}", inquiryId);
            return ResponseEntity.ok(answered);
        } catch (Exception e) {
            log.error("Error answering inquiry ID: {}", inquiryId, e);
            throw e;
        }
    }
    
    @DeleteMapping("/inquiries/{inquiryId}")
    public ResponseEntity<Void> deleteInquiry(@PathVariable("inquiryId") Long inquiryId) {
        try {
            adminService.deleteInquiry(inquiryId);
            log.info("Deleted inquiry ID: {}", inquiryId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error deleting inquiry ID: {}", inquiryId, e);
            throw e;
        }
    }
    
    // ===== 통계 =====
    
    @GetMapping("/stats/user-growth")
    public ResponseEntity<List<UserGrowthDTO>> getUserGrowthStats(
            @RequestParam(name = "days", defaultValue = "30") int days) {
        try {
            List<UserGrowthDTO> stats = adminService.getUserGrowthStats(days);
            log.info("Retrieved user growth stats for {} days", days);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error retrieving user growth stats", e);
            throw e;
        }
    }
    
    @GetMapping("/stats/regional-chat")
    public ResponseEntity<List<RegionalChatStatsDTO>> getRegionalChatStats() {
        try {
            List<RegionalChatStatsDTO> stats = adminService.getRegionalChatStats();
            log.info("Retrieved regional chat stats");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error retrieving regional chat stats", e);
            throw e;
        }
    }
}