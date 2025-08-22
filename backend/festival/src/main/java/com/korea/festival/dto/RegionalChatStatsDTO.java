package com.korea.festival.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegionalChatStatsDTO {
    private String region;
    private Long messageCount;
    private Long activeUsers;
    private Long todayMessages;
}