package com.korea.festival.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportResolutionDto {
    
    @NotBlank(message = "처리 상태는 필수입니다")
    private String status; // RESOLVED, REJECTED
    
    private String adminNotes;
}