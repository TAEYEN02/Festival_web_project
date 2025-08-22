package com.korea.festival.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InquiryAnswerDTO {
    @NotBlank(message = "답변 내용은 필수입니다")
    private String answer;

}