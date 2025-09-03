package com.korea.festival.dto;

import java.util.List;

import lombok.Data;

@Data
public class AdminDashboardDTO {
    
    // 기존 사용자/문의 관련 필드들
    private Long totalUsers;
    private Long activeUsers;
    private Long inactiveUsers;
    private Long totalInquiries;
    private Long pendingInquiries;
    private Long answeredInquiries;
    
    // 채팅 관련 새 필드들 추가
    private Long totalMessages;        // 총 채팅 메시지 수
    private Long pendingReports;       // 대기 중인 채팅 신고 수
    private Integer onlineUsers;       // 현재 접속 중인 사용자 수
    private Integer activeRegions;     // 활성 지역 수
    
    private List<RegionalChatStatsDTO> regionalStats;
}