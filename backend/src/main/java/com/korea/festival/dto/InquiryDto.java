package com.korea.festival.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class InquiryDto {
    private Long inquiryId;
    private String title;
    private String author;
    private LocalDateTime createdAt;
    private boolean isAnswered;
}
