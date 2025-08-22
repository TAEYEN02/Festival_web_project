package com.korea.festival.service;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.korea.festival.repository.InquiryRepository;
import com.korea.festival.repository.RegionalChatRepository;
import com.korea.festival.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticsService {
    
    private final UserRepository userRepository;
    private final InquiryRepository inquiryRepository;
    private final RegionalChatRepository regionalChatRepository;
    
    // 매일 자정에 일일 통계 수집
    @Scheduled(cron = "0 0 0 * * *")
    public void collectDailyStatistics() {
        log.info("일일 통계 수집 시작");
        
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime yesterday = today.minusDays(1);
        
        // 일일 신규 사용자 수
        Long newUsers = userRepository.countUsersByDateRange(yesterday, today);
        
        // 일일 신규 문의 수
        Long newInquiries = inquiryRepository.countInquiriesByDateRange(yesterday, today);
        
        // 일일 채팅 메시지 수
        Long newMessages = regionalChatRepository.countTodayMessages(yesterday);
        
        log.info("일일 통계 - 신규 사용자: {}, 신규 문의: {}, 채팅 메시지: {}", 
                newUsers, newInquiries, newMessages);
        
        // 여기서 통계를 별도 테이블에 저장하거나 외부 시스템으로 전송할 수 있습니다.
    }
    
    // 매시간 온라인 사용자 수 체크
    @Scheduled(fixedRate = 3600000) // 1시간마다
    public void updateOnlineUserCount() {
        LocalDateTime lastHour = LocalDateTime.now().minusHours(1);
        Long onlineUsers = regionalChatRepository.countActiveChatUsers(lastHour);
        
        log.debug("현재 온라인 사용자 수: {}", onlineUsers);
        
        // 온라인 사용자 수를 캐시나 데이터베이스에 저장
    }
}

