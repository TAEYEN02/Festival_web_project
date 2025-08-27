package com.korea.festival.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegionalChatStatsDTO {
    private String region;
    private Long messageCount;
    private Long activeUsers;
    private Long todayMessages;
    private Long reportCount;
}