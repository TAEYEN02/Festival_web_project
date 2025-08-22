package com.korea.festival.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.korea.festival.dto.AdminDashboardDTO;
import com.korea.festival.dto.AdminInquiryDTO;
import com.korea.festival.dto.AdminUserDTO;
import com.korea.festival.dto.InquiryAnswerDTO;
import com.korea.festival.dto.InquiryDto;
import com.korea.festival.dto.InquiryResponseDto;
import com.korea.festival.dto.RegionalChatStatsDTO;
import com.korea.festival.dto.UserDetailDto;
import com.korea.festival.dto.UserGrowthDTO;
import com.korea.festival.entity.InquiryStatus;
import com.korea.festival.entity.User;
import com.korea.festival.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {
    
    private final UserRepository userRepository;
    // 추후 추가될 Repository들
    // private final InquiryRepository inquiryRepository;
    // private final RegionalChatRepository regionalChatRepository;
    
    @Transactional(readOnly = true)
    public AdminDashboardDTO getDashboardStats() {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        
        Long totalUsers = userRepository.countActiveUsers();
        Long todayNewUsers = userRepository.countUsersByDateRange(today, today.plusDays(1));
        
        AdminDashboardDTO dashboard = new AdminDashboardDTO();
        dashboard.setTotalUsers(totalUsers);
        dashboard.setTodayNewUsers(todayNewUsers);
        dashboard.setOnlineUsers(0L); // 추후 구현
        dashboard.setPendingInquiries(0L); // 추후 구현
        dashboard.setActiveChatUsers(0L); // 추후 구현
        dashboard.setTotalInquiries(0L); // 추후 구현
        
        return dashboard;
    }
    
    @Transactional(readOnly = true)
    public Page<AdminUserDTO> getUsers(Pageable pageable, Boolean isActive) {
        Page<User> users;
        if (isActive == null) {
            users = userRepository.findAllByOrderByCreatedAtDesc(pageable);
        } else if (isActive) {
            users = userRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable);
        } else {
            users = userRepository.findByIsActiveFalseOrderByCreatedAtDesc(pageable);
        }
        
        return users.map(this::convertToAdminUserDTO);
    }
    
    // AdminController에서 요구하는 getUserDetail 메서드 (AdminUserDTO 반환)
    @Transactional(readOnly = true)
    public AdminUserDTO getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        return convertToAdminUserDTO(user);
    }
    
    // 기존 메서드도 유지 (UserDetailDto 반환)
    @Transactional(readOnly = true)
    public UserDetailDto getUserDetailAsDto(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        return convertToUserDetailDto(user);
    }
    
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }
    
    // AdminController에서 요구하는 getInquiries 메서드 (AdminInquiryDTO 반환)
    @Transactional(readOnly = true)
    public Page<AdminInquiryDTO> getInquiries(Pageable pageable, InquiryStatus status) {
        // 임시 구현 - 실제로는 InquiryRepository 사용
        List<AdminInquiryDTO> inquiries = new ArrayList<>();
        
        // 샘플 데이터 생성
        for (int i = 1; i <= 5; i++) {
            AdminInquiryDTO inquiry = new AdminInquiryDTO();
            inquiry.setId((long) i);
            inquiry.setInquiryNumber("INQ-2024-" + String.format("%03d", i));
            inquiry.setUserNickname("사용자" + i);
            inquiry.setTitle("문의 제목 " + i);
            inquiry.setContent("문의 내용 " + i);
            inquiry.setStatus(i % 2 == 0 ? "ANSWERED" : "PENDING");
            inquiry.setCreatedAt(LocalDateTime.now().minusDays(i));
            
            if (inquiry.getStatus().equals("ANSWERED")) {
                inquiry.setAnswer("답변 내용 " + i);
                inquiry.setAnsweredAt(LocalDateTime.now().minusDays(i - 1));
            }
            
            // status 필터링
            if (status == null || inquiry.getStatus().equals(status.name())) {
                inquiries.add(inquiry);
            }
        }
        
        return new PageImpl<>(inquiries, pageable, inquiries.size());
    }
    
    // AdminController에서 요구하는 getInquiry 메서드
    @Transactional(readOnly = true)
    public AdminInquiryDTO getInquiry(Long inquiryId) {
        // 임시 구현 - 실제로는 InquiryRepository 사용
        AdminInquiryDTO inquiry = new AdminInquiryDTO();
        inquiry.setId(inquiryId);
        inquiry.setInquiryNumber("INQ-2024-" + String.format("%03d", inquiryId));
        inquiry.setUserNickname("김철수");
        inquiry.setTitle("축제 예매 관련 문의");
        inquiry.setContent("축제 예매가 안되는데 확인 부탁드립니다. 결제는 완료되었는데 예매 내역이 보이지 않습니다.");
        inquiry.setStatus("PENDING");
        inquiry.setCreatedAt(LocalDateTime.now().minusDays(1));
        
        return inquiry;
    }
    
    // AdminController에서 요구하는 answerInquiry 메서드
    public AdminInquiryDTO answerInquiry(Long inquiryId, InquiryAnswerDTO answerDTO) {
        // 임시 구현 - 실제로는 InquiryRepository 사용
        AdminInquiryDTO inquiry = getInquiry(inquiryId);
        inquiry.setAnswer(answerDTO.getAnswer());
        inquiry.setStatus("ANSWERED");
        inquiry.setAnsweredAt(LocalDateTime.now());
        
        // 실제 구현에서는 데이터베이스 업데이트
        // Inquiry entity = inquiryRepository.findById(inquiryId)...
        // entity.setAnswer(answerDTO.getAnswer());
        // entity.setStatus(InquiryStatus.ANSWERED);
        // inquiryRepository.save(entity);
        
        return inquiry;
    }
    
    // AdminController에서 요구하는 getUserGrowthStats 메서드
    @Transactional(readOnly = true)
    public List<UserGrowthDTO> getUserGrowthStats(int days) {
        List<UserGrowthDTO> stats = new ArrayList<>();
        
        // 임시 구현 - 실제로는 데이터베이스에서 일별 가입자 수 조회
        LocalDate today = LocalDate.now();
        long cumulativeUsers = 1000L; // 시작 사용자 수
        
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            long newUsers = (long) (Math.random() * 15 + 1); // 1-15명 랜덤
            cumulativeUsers += newUsers;
            
            UserGrowthDTO stat = new UserGrowthDTO();
            stat.setDate(date);
            stat.setNewUsers(newUsers);
            stat.setTotalUsers(cumulativeUsers);
            stats.add(stat);
        }
        
        return stats;
    }
    
    // AdminController에서 요구하는 getRegionalChatStats 메서드
    @Transactional(readOnly = true)
    public List<RegionalChatStatsDTO> getRegionalChatStats() {
        List<RegionalChatStatsDTO> stats = new ArrayList<>();
        
        // 임시 구현 - 실제로는 RegionalChatRepository 사용
        String[] regions = {
            "서울시 강남구", "서울시 종로구", "서울시 마포구",
            "부산시 해운대구", "부산시 중구",
            "대구시 중구", "대구시 수성구",
            "인천시 연수구", "광주시 서구"
        };
        
        for (String region : regions) {
            RegionalChatStatsDTO stat = new RegionalChatStatsDTO();
            stat.setRegion(region);
            stat.setMessageCount((long) (Math.random() * 1500 + 200)); // 200-1700 메시지
            stat.setActiveUsers((long) (Math.random() * 80 + 20)); // 20-100 활성 사용자
            stat.setTodayMessages((long) (Math.random() * 30 + 5)); // 5-35 오늘 메시지
            stats.add(stat);
        }
        
        // 메시지 수 기준으로 내림차순 정렬
        stats.sort((a, b) -> b.getMessageCount().compareTo(a.getMessageCount()));
        
        return stats;
    }
    
    // 기존 메서드들 (호환성 유지)
    @Transactional(readOnly = true)
    public Page<InquiryDto> getInquiries(int page, int size, String status) {
        // 기본 구현 - 추후 확장
        return Page.empty();
    }
    
    public void respondToInquiry(Long inquiryId, InquiryResponseDto responseDto, String name) {
        // 기본 구현 - 추후 확장
    }
    
    // DTO 변환 메서드들
    private AdminUserDTO convertToAdminUserDTO(User user) {
        return new AdminUserDTO(
            user.getId(),
            generateUserId(user.getId(), user.getCreatedAt()),
            user.getUsername(),
            user.getNickname(),
            user.getEmail(),
            user.getIsActive(),
            user.getCreatedAt(),
            user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet()),
            (long) (user.getInquiries() != null ? user.getInquiries().size() : 0),
            (long) (user.getWishlists() != null ? user.getWishlists().size() : 0),
            (long) (user.getRegionalChats() != null ? user.getRegionalChats().size() : 0)
        );
    }
    
    private UserDetailDto convertToUserDetailDto(User user) {
        Set<String> roleNames = user.getRoles().stream()
            .map(role -> role.getName().name())
            .collect(Collectors.toSet());
        
        return new UserDetailDto(
            user.getId(),
            user.getUsername(),
            user.getNickname(),
            user.getEmail(),
            roleNames,
            user.getIsActive(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
    
    private String generateUserId(Long id, LocalDateTime createdAt) {
        return String.format("USR-%s-%03d", 
            createdAt.format(DateTimeFormatter.ofPattern("yyyy")), id);
    }
}
