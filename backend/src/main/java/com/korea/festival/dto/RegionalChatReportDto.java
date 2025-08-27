package com.korea.festival.dto;

import java.time.LocalDateTime;

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
}