package com.korea.festival.dto;

import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatDashboardDTO {
    private Map<String, Object> realTimeStats;
    private List<RegionalChatStatsDTO> regionalStats;
}
