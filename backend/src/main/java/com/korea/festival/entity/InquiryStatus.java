package com.korea.festival.entity;

public enum InquiryStatus {
    PENDING("답변 대기"),
    ANSWERED("답변 완료"),
    CLOSED("종료");
    
    private final String description;
    
    InquiryStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}