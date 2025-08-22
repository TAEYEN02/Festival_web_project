package com.korea.festival.dto;

import lombok.Data;

@Data
public class AdminDashboardDto {
    private long totalUsers;
    private long newUsersToday;
    private long totalInquiries;
    private long unansweredInquiries;
}
