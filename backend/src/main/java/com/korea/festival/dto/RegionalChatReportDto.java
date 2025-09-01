package com.korea.festival.dto;

import java.time.LocalDateTime;

import com.korea.festival.entity.RegionalChatReport;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegionalChatReportDto {
    private Long id;
    private Long messageId;
    private String messageContent;
    private String messageAuthor;
    private String region;
    private String reporterNickname;
    private String reason;
    private String description;
    private String status;
    private LocalDateTime reportedAt;
    private LocalDateTime resolvedAt;
    private String adminNotes;
    
    public RegionalChatReportDto(RegionalChatReport report) {
        this.id = report.getId();

        // 메시지 내용
        this.messageContent = report.getMessage() != null 
                              ? report.getMessage().getMessage()  // RegionalChat 필드명에 맞춤
                              : null;

        // 작성자 닉네임
        this.messageAuthor = (report.getMessage() != null && report.getMessage().getUser() != null) 
                             ? report.getMessage().getUser().getNickname() 
                             : null;

        // 지역
        this.region = report.getMessage() != null 
                      ? report.getMessage().getRegion() 
                      : null;

        // 신고자 닉네임
        this.reporterNickname = report.getReporter() != null 
                                ? report.getReporter().getNickname() 
                                : null;

        this.reason = report.getReason();
        this.description = report.getDescription();
        this.status = report.getStatus() != null ? report.getStatus().name() : null;
        this.reportedAt = report.getReportedAt();
        this.resolvedAt = report.getResolvedAt();
        this.adminNotes = report.getAdminNotes();
    }
}