package com.korea.festival.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.korea.festival.dto.AdminDashboardDTO;
import com.korea.festival.dto.AdminInquiryDTO;
import com.korea.festival.dto.AdminUserDTO;
import com.korea.festival.dto.InquiryAnswerDTO;
import com.korea.festival.dto.RegionalChatDto;
import com.korea.festival.dto.RegionalChatReportDto;
import com.korea.festival.dto.RegionalChatStatsDTO;
import com.korea.festival.dto.ReportResolutionDto;
import com.korea.festival.dto.UserGrowthDTO;
import com.korea.festival.entity.InquiryStatus;
import com.korea.festival.entity.RegionalChat;
import com.korea.festival.entity.ReportStatus;
import com.korea.festival.handler.ChatWebSocketHandler;
import com.korea.festival.repository.RegionalChatRepository;
import com.korea.festival.service.AdminService;
import com.korea.festival.service.RegionalChatService;

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
    private final RegionalChatService regionalChatService;
    private final ChatWebSocketHandler chatWebSocketHandler;
    private final RegionalChatRepository chatRepository;
    
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
    
    //사용자 삭제
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable("userId") Long userId) {
        try {
            adminService.deleteUser(userId);
            log.info("Deleted user with ID: {}", userId);
            return ResponseEntity.ok().body("사용자가 삭제되었습니다.");
        } catch (RuntimeException e) {
            log.error("Failed to delete user with ID: {}", userId, e);
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error deleting user with ID: {}", userId, e);
            return ResponseEntity.status(500).body("사용자 삭제 중 서버 오류가 발생했습니다.");
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
    
    // ===== 실시간 채팅 관리 =====
    
    /**
     * 실시간 통계 조회
     */
    @GetMapping("/chat/stats/realtime")
    public ResponseEntity<Map<String, Object>> getRealTimeChatStats() {
        try {
            Map<String, Integer> regionUserCounts = chatWebSocketHandler.getRegionUserCounts();
            
            int totalOnlineUsers = regionUserCounts.values().stream()
                .mapToInt(Integer::intValue).sum();
            
            Map<String, Object> stats = Map.of(
                "totalOnlineUsers", totalOnlineUsers,
                "activeRegions", regionUserCounts.size(),
                "regionUserCounts", regionUserCounts,
                "timestamp", System.currentTimeMillis()
            );
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error retrieving real-time chat stats", e);
            throw e;
        }
    }
    
    /**
     * 채팅 신고 목록 조회
     */
    @GetMapping("/chat/reports")
    public ResponseEntity<Page<RegionalChatReportDto>> getChatReports(
            @RequestParam(name="status", required=false) String status,
            @RequestParam(name="region", required=false) String region,
            @PageableDefault(size = 20, sort = "reportedAt", direction = Sort.Direction.DESC) Pageable pageable) {

        ReportStatus reportStatus = null;
        if (status != null && !status.equalsIgnoreCase("all")) {
            try {
                reportStatus = ReportStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        String regionFilter = (region != null && !region.equalsIgnoreCase("all")) ? region : null;

        Page<RegionalChatReportDto> reports = regionalChatService.getReports(reportStatus, regionFilter, pageable);

        return ResponseEntity.ok(reports);
    }
    
    /**
     * 채팅 신고 처리
     */
    @PutMapping("/chat/reports/{reportId}/resolve")
    public ResponseEntity<?> resolveChatReport(
            @PathVariable("reportId") Long reportId,
            @Valid @RequestBody ReportResolutionDto resolutionDto,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            ReportStatus status = ReportStatus.valueOf(resolutionDto.getStatus().toUpperCase());
            regionalChatService.resolveReport(
                reportId, 
                userDetails.getUsername(), 
                status, 
                resolutionDto.getAdminNotes()
            );
            
            return ResponseEntity.ok(Map.of("message", "신고가 처리되었습니다"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("잘못된 상태값입니다");
        } catch (Exception e) {
            log.error("Error resolving chat report: reportId=" + reportId, e);
            return ResponseEntity.internalServerError().body("신고 처리에 실패했습니다");
        }
    }
    
    /**
     * 채팅 메시지 강제 삭제
     */
    @DeleteMapping("/chat/messages/{messageId}")
    public ResponseEntity<?> deleteChatMessage(
            @PathVariable("messageId") Long messageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            regionalChatService.deleteMessageByAdmin(messageId, userDetails.getUsername());
            return ResponseEntity.ok(Map.of("message", "메시지가 삭제되었습니다"));
        } catch (Exception e) {
            log.error("Error deleting chat message: messageId=" + messageId, e);
            return ResponseEntity.internalServerError().body("메시지 삭제에 실패했습니다");
        }
    }
    
    /**
     * 메시지 관리 목록
     * */
    @GetMapping("/chat/messages")
    public Page<RegionalChatDto> getMessages(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "region", required = false) String region,
            @RequestParam(name = "search", required = false) String search) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<RegionalChat> chats = chatRepository.findByRegionAndSearch(
                region != null && !region.equals("all") ? region : null,
                search != null && !search.isBlank() ? search : null,
                pageable
        );

        return chats.map(RegionalChatDto::new);
    }
    
    /**
     * 실시간 이벤트 스트림 (Server-Sent Events)
     */
    @GetMapping(value = "/chat/events", produces = "text/event-stream")
    public SseEmitter streamChatEvents() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        
        try {
            emitter.send("연결되었습니다");
        } catch (Exception e) {
            emitter.completeWithError(e);
        }
        
        return emitter;
    }
}