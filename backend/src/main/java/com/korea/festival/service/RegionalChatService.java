package com.korea.festival.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.korea.festival.dto.RegionalChatDto;
import com.korea.festival.dto.RegionalChatReportDto;
import com.korea.festival.dto.RegionalChatStatsDTO;
import com.korea.festival.entity.RegionalChat;
import com.korea.festival.entity.RegionalChatReport;
import com.korea.festival.entity.ReportStatus;
import com.korea.festival.entity.User;
import com.korea.festival.repository.RegionalChatReportRepository;
import com.korea.festival.repository.RegionalChatRepository;
import com.korea.festival.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class RegionalChatService {
    
    private final RegionalChatRepository regionalChatRepository;
    private final RegionalChatReportRepository reportRepository;
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public Page<RegionalChatDto> getRegionalMessages(String region, Pageable pageable) {
        Page<RegionalChat> messages;

        if (region == null || region.isBlank()) {
            messages = regionalChatRepository.findAllByOrderByCreatedAtDesc(pageable);
        } else {
            messages = regionalChatRepository.findByRegionOrderByCreatedAtDesc(region, pageable);
        }

        return messages.map(this::convertToDto);
    }
    
    @Transactional(readOnly = true)
    public Page<RegionalChatDto> getUserMessages(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        Page<RegionalChat> messages = regionalChatRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return messages.map(chat -> convertToDto(chat));
    }
    
    public RegionalChatDto sendMessage(String username, RegionalChatDto chatDto) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        // 메시지 길이 및 내용 검증
        if (chatDto.getMessage().length() > 500) {
            throw new RuntimeException("메시지는 500자를 초과할 수 없습니다");
        }
        
        // 스팸 방지 (1분 내 동일한 메시지 체크)
        if (isDuplicateMessage(user, chatDto.getMessage(), chatDto.getRegion())) {
            throw new RuntimeException("동일한 메시지를 너무 자주 보낼 수 없습니다");
        }
        
        RegionalChat chat = RegionalChat.builder()
            .user(user)
            .region(chatDto.getRegion())
            .message(chatDto.getMessage())
            .build();
        
        RegionalChat saved = regionalChatRepository.save(chat);
        log.info("새 메시지 저장: 사용자={}, 지역={}", username, chatDto.getRegion());
        
        return convertToDto(saved);
    }
    
    public void deleteMessage(String username, Long messageId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        RegionalChat message = regionalChatRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("메시지를 찾을 수 없습니다"));
        
        // 본인의 메시지만 삭제 가능
        if (!message.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("본인의 메시지만 삭제할 수 있습니다");
        }
        
        regionalChatRepository.delete(message);
        log.info("메시지 삭제: 사용자={}, 메시지ID={}", username, messageId);
    }
    
    // 관리자용 메시지 삭제
    public void deleteMessageByAdmin(Long messageId, String adminUsername) {
        User admin = userRepository.findByUsername(adminUsername)
            .orElseThrow(() -> new RuntimeException("관리자를 찾을 수 없습니다"));
        
        RegionalChat message = regionalChatRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("메시지를 찾을 수 없습니다"));
        
        regionalChatRepository.delete(message);
        log.info("관리자 메시지 삭제: 관리자={}, 메시지ID={}", adminUsername, messageId);
    }
    
    // 신고 기능
    public void reportMessage(Long messageId, Long reporterId, String reporterNickname, String reason) {
        RegionalChat message = regionalChatRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("신고할 메시지를 찾을 수 없습니다"));

        User reporter = userRepository.findById(reporterId)
            .orElseThrow(() -> new RuntimeException("신고자를 찾을 수 없습니다"));

        // 중복 신고 방지
        if (reportRepository.existsByMessageIdAndReporterId(messageId, reporterId)) {
            throw new RuntimeException("이미 신고한 메시지입니다");
        }

        RegionalChatReport report = RegionalChatReport.builder()
            .message(message)
            .reporter(reporter)
            .reason(reason)
            .status(ReportStatus.PENDING)
            .build();

        reportRepository.save(report);
        log.info("메시지 신고: 신고자={}, 메시지ID={}, 사유={}", reporterNickname, messageId, reason);

        // 신고가 일정 수 이상이면 자동으로 메시지 숨김 처리
        long reportCount = reportRepository.countReportsByMessageId(messageId);
        if (reportCount >= 5) {
            message.setIsHidden(true); // setHidden 대신 setIsHidden 사용
            regionalChatRepository.save(message);
            log.info("메시지 자동 숨김 처리: 메시지ID={}, 신고수={}", messageId, reportCount);
        }
    }
    
    // 관리자용 신고 조회
    @Transactional(readOnly = true)
    public Page<RegionalChatReportDto> getReports(ReportStatus status, String region, Pageable pageable) {
        return reportRepository.findByFilters(status, region, pageable)
                               .map(this::convertToReportDto); // ✅ 생성자 대신 변환 메서드 사용
    }
    
    // 신고 처리
    public void resolveReport(Long reportId, String adminUsername, ReportStatus status, String adminNotes) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("관리자를 찾을 수 없습니다"));

        RegionalChatReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("신고를 찾을 수 없습니다"));

        // 상태 갱신
        report.setStatus(status);
        report.setResolvedAt(LocalDateTime.now());
        report.setAdminNotes(adminNotes);
        report.setResolvedBy(admin); // resolvedBy 필드 존재 시

        reportRepository.save(report);

        // 신고 승인 시 메시지 삭제 (자식 신고 먼저 삭제)
        if (status == ReportStatus.RESOLVED) {
            RegionalChat chat = report.getMessage();

            // 1. 메시지와 관련된 모든 신고 삭제
            reportRepository.deleteAllByMessage(chat);

            // 2. 메시지 삭제
            regionalChatRepository.delete(chat);
        }

        log.info("신고 처리 완료: 관리자={}, 신고ID={}, 처리결과={}", adminUsername, reportId, status);
    }
    
    // 지역별 통계
    @Transactional(readOnly = true)
    public List<RegionalChatStatsDTO> getRegionalStats() {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime weekAgo = today.minusDays(7);  // weekAgo 매개변수 추가
        
        List<Object[]> results = regionalChatRepository.getRegionalMessageStats(today, weekAgo);

        return results.stream()
            .map((Object[] row) -> {
                return RegionalChatStatsDTO.builder()
                    .region((String) row[0])
                    .messageCount((Long) row[1])
                    .activeUsers((Long) row[2])
                    .todayMessages((Long) row[3])
                    .build();
            })
            .collect(Collectors.toList());
    }
    
    private boolean isDuplicateMessage(User user, String message, String region) {
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        return regionalChatRepository.existsByUserAndMessageAndRegionAndCreatedAtAfter(
            user, message, region, oneMinuteAgo);
    }
    
    private RegionalChatDto convertToDto(RegionalChat chat) {
        RegionalChatDto dto = new RegionalChatDto();
        dto.setId(chat.getId());
        dto.setRegion(chat.getRegion());
        dto.setMessage(chat.getMessage());
        dto.setUserNickname(chat.getUser().getNickname());
        dto.setCreatedAt(chat.getCreatedAt());
        return dto;
    }
    
    private RegionalChatReportDto convertToReportDto(RegionalChatReport report) {
        return RegionalChatReportDto.builder()
            .id(report.getId())
            .messageId(report.getMessage().getId())
            .messageContent(report.getMessage().getMessage())
            .messageAuthor(report.getMessage().getUser().getNickname())
            .region(report.getMessage().getRegion())
            .reporterNickname(report.getReporter().getNickname())
            .reason(report.getReason())
            .description(report.getDescription())
            .status(report.getStatus().name())
            .reportedAt(report.getReportedAt())
            .resolvedAt(report.getResolvedAt())
            .adminNotes(report.getAdminNotes())
            .build();
    }
}
