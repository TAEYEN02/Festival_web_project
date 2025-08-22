package com.korea.festival.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class AdminUtils {
    
    private static final DateTimeFormatter USER_ID_FORMATTER = DateTimeFormatter.ofPattern("yyyy");
    private static final DateTimeFormatter INQUIRY_ID_FORMATTER = DateTimeFormatter.ofPattern("yyyy");
    
    public static String generateUserId(Long id, LocalDateTime createdAt) {
        return String.format("USR-%s-%03d", 
            createdAt.format(USER_ID_FORMATTER), id);
    }
    
    public static String generateInquiryNumber(Long id, LocalDateTime createdAt) {
        return String.format("INQ-%s-%03d", 
            createdAt.format(INQUIRY_ID_FORMATTER), id);
    }
    
    public static String getStatusBadgeClass(String status) {
        switch (status.toUpperCase()) {
            case "PENDING":
                return "badge-warning";
            case "ANSWERED":
                return "badge-success";
            case "CLOSED":
                return "badge-secondary";
            default:
                return "badge-light";
        }
    }
    
    public static String getStatusDisplayName(String status) {
        switch (status.toUpperCase()) {
            case "PENDING":
                return "대기중";
            case "ANSWERED":
                return "답변완료";
            case "CLOSED":
                return "종료";
            default:
                return status;
        }
    }
}