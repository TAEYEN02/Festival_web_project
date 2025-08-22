package com.korea.festival.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminDashboardDTO {
    private Long totalUsers;
    private Long onlineUsers;
    private Long pendingInquiries;
    private Long activeChatUsers;
    private Long todayNewUsers;
    private Long totalInquiries;
}
