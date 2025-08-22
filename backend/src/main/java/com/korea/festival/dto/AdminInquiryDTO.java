package com.korea.festival.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminInquiryDTO {
    private Long id;
    private String inquiryNumber; // INQ-2024-001 형태
    private String userNickname;
    private String title;
    private String content;
    private String status;
    private String answer;
    private LocalDateTime createdAt;
    private LocalDateTime answeredAt;
    private String adminAnswer;
}
