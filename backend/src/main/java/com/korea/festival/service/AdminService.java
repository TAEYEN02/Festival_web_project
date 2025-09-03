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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import com.korea.festival.entity.Inquiry;
import com.korea.festival.entity.InquiryStatus;
import com.korea.festival.entity.User;
import com.korea.festival.repository.InquiryRepository;
import com.korea.festival.repository.RegionalChatReportRepository;
import com.korea.festival.repository.RegionalChatRepository;
import com.korea.festival.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AdminService {
    
    private final UserRepository userRepository;
    private final InquiryRepository inquiryRepository;
    private final RegionalChatRepository chatRepository;
    private final RegionalChatReportRepository regionalChatReportRepository;
    
    @Transactional(readOnly = true)
    public AdminDashboardDTO getDashboardStats() {
        AdminDashboardDTO dto = new AdminDashboardDTO();
        
        // 기존 사용자/문의 통계
        dto.setTotalUsers(userRepository.count());
        dto.setActiveUsers(userRepository.countByIsActiveTrue());
        dto.setInactiveUsers(userRepository.countByIsActiveFalse());
        dto.setTotalInquiries(inquiryRepository.count());
        dto.setPendingInquiries(inquiryRepository.countByStatus(InquiryStatus.PENDING));
        dto.setAnsweredInquiries(inquiryRepository.countByStatus(InquiryStatus.ANSWERED));
        
        // 채팅 관련 통계는 AdminController에서 설정하므로 여기서는 기본값만 설정
        dto.setTotalMessages(0L);
        dto.setPendingReports(0L);
        dto.setOnlineUsers(0);
        dto.setActiveRegions(0);
        
        // 지역별 통계 (필요한 경우)
        dto.setRegionalStats(getRegionalChatStats());
        
        return dto;
    }
    
    // 임시로 검색 기능을 간소화한 getUsers 메서드
    @Transactional(readOnly = true)
    public Page<AdminUserDTO> getUsers(Pageable pageable, Boolean isActive, String search) {
        Page<User> users;
        
        // 현재는 검색 기능을 로깅만 하고 기본 로직 사용
        if (search != null && !search.trim().isEmpty()) {
            log.info("Search requested for users with keyword: '{}' - Using basic filtering for now", search.trim());
        }
        
        // 기본 로직 사용 (검색 기능은 Repository 메서드 추가 후 구현 예정)
        if (isActive == null) {
            users = userRepository.findAllByOrderByCreatedAtDesc(pageable);
        } else if (isActive) {
            users = userRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable);
        } else {
            users = userRepository.findByIsActiveFalseOrderByCreatedAtDesc(pageable);
        }
        
        // 검색어가 있는 경우 메모리에서 필터링 (임시 방편)
        if (search != null && !search.trim().isEmpty()) {
            String trimmedSearch = search.trim().toLowerCase();
            List<User> filteredUsers = users.getContent().stream()
                .filter(user -> 
                    (user.getUsername() != null && user.getUsername().toLowerCase().contains(trimmedSearch)) ||
                    (user.getNickname() != null && user.getNickname().toLowerCase().contains(trimmedSearch)) ||
                    (user.getEmail() != null && user.getEmail().toLowerCase().contains(trimmedSearch))
                )
                .collect(Collectors.toList());
            
            // 필터링된 결과로 새 Page 생성
            users = new PageImpl<>(filteredUsers, pageable, filteredUsers.size());
        }

        return users.map(this::convertToAdminUserDTO);
    }
    
    // 호환성을 위한 오버로드 메서드
    @Transactional(readOnly = true)
    public Page<AdminUserDTO> getUsers(Pageable pageable, Boolean isActive) {
        return getUsers(pageable, isActive, null);
    }
    
    @Transactional(readOnly = true)
    public AdminUserDTO getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        return convertToAdminUserDTO(user);
    }
    
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
    
    // 임시로 검색 기능을 간소화한 getInquiries 메서드 (실제 문의 데이터 조회)
    @Transactional(readOnly = true)
    public Page<AdminInquiryDTO> getInquiries(Pageable pageable, InquiryStatus status, String search) {
        Page<Inquiry> inquiries;
        
        // 현재는 검색 기능을 로깅만 하고 기본 로직 사용
        if (search != null && !search.trim().isEmpty()) {
            log.info("Search requested for inquiries with keyword: '{}' - Using basic filtering for now", search.trim());
        }
        
        // 기본 로직 사용 (검색 기능은 Repository 메서드 추가 후 구현 예정)
        if (status == null) {
            inquiries = inquiryRepository.findAllByOrderByCreatedAtDesc(pageable);
        } else {
            inquiries = inquiryRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        }
        
        // 검색어가 있는 경우 메모리에서 필터링 (임시 방편)
        if (search != null && !search.trim().isEmpty()) {
            String trimmedSearch = search.trim().toLowerCase();
            List<Inquiry> filteredInquiries = inquiries.getContent().stream()
                .filter(inquiry -> 
                    (inquiry.getTitle() != null && inquiry.getTitle().toLowerCase().contains(trimmedSearch)) ||
                    (inquiry.getContent() != null && inquiry.getContent().toLowerCase().contains(trimmedSearch))
                )
                .collect(Collectors.toList());
            
            // 필터링된 결과로 새 Page 생성
            inquiries = new PageImpl<>(filteredInquiries, pageable, filteredInquiries.size());
        }
        
        return inquiries.map(this::convertToAdminInquiryDTO);
    }
    
    // 호환성을 위한 오버로드 메서드
    @Transactional(readOnly = true)
    public Page<AdminInquiryDTO> getInquiries(Pageable pageable, InquiryStatus status) {
        return getInquiries(pageable, status, null);
    }
    
    // 실제 문의 상세 조회
    @Transactional(readOnly = true)
    public AdminInquiryDTO getInquiry(Long inquiryId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
            .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다"));
        
        return convertToAdminInquiryDTO(inquiry);
    }
    
    // 실제 문의 답변 처리
    public AdminInquiryDTO answerInquiry(Long inquiryId, InquiryAnswerDTO answerDTO) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
            .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다"));
        
        inquiry.setAnswer(answerDTO.getAnswer());
        inquiry.setStatus(InquiryStatus.ANSWERED);
        inquiry.setAnsweredAt(LocalDateTime.now());
        
        Inquiry saved = inquiryRepository.save(inquiry);
        
        return convertToAdminInquiryDTO(saved);
    }
    
    //사용자 삭제
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));

        // 1. 이 유저가 reporter인 신고 내역 먼저 삭제
        regionalChatReportRepository.deleteByReporterId(userId);

        // (추가) 이 유저가 작성한 RegionalChat, 댓글, 좋아요 등 다른 FK 참조도 있다면 순서대로 삭제

        // 2. 유저 삭제
        userRepository.delete(user);
    }
    
    // 실제 사용자 증가 통계
    @Transactional(readOnly = true)
    public List<UserGrowthDTO> getUserGrowthStats(int days) {
        List<UserGrowthDTO> stats = new ArrayList<>();
        
        LocalDate today = LocalDate.now();
        
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            LocalDateTime startDate = date.atStartOfDay();
            LocalDateTime endDate = startDate.plusDays(1);
            
            Long newUsers = userRepository.countUsersByDateRange(startDate, endDate);
            
            // 누적 사용자 수 계산 (해당 날짜까지의 총 사용자)
            Long totalUsers = userRepository.countUsersByDateRange(
                LocalDateTime.of(2020, 1, 1, 0, 0), 
                endDate
            );
            
            UserGrowthDTO stat = new UserGrowthDTO();
            stat.setDate(date);
            stat.setNewUsers(newUsers);
            stat.setTotalUsers(totalUsers);
            stats.add(stat);
        }
        
        return stats;
    }
    
    // 지역별 채팅 통계 (실제 데이터 or 기본값)
    @Transactional(readOnly = true)
    public List<RegionalChatStatsDTO> getRegionalChatStats() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime weekAgo = todayStart.minusDays(7);

        // 프론트 매핑 ID 기준
        String[] regions = {
            "seoul", "busan", "daegu", "incheon", "gwangju",
            "daejeon", "ulsan", "gyeonggi", "gangwon",
            "north-chungcheong", "south-chungcheong",
            "north-jeolla", "south-jeolla",
            "north-gyeongsang", "south-gyeongsang", "jeju"
        };

        List<RegionalChatStatsDTO> stats = new ArrayList<>();

        for (String regionId : regions) {
            Long messageCount = chatRepository.countByRegionAndCreatedAtAfter(regionId, weekAgo);
            Long activeUsers = chatRepository.countUniqueUsersByRegionAndCreatedAtAfter(regionId, weekAgo);
            Long todayMessages = chatRepository.countByRegionAndCreatedAtAfter(regionId, todayStart);

            RegionalChatStatsDTO dto = new RegionalChatStatsDTO();
            dto.setRegion(regionId);  // 프론트 ID 그대로 전달
            dto.setMessageCount(messageCount != null ? messageCount : 0L);
            dto.setActiveUsers(activeUsers != null ? activeUsers : 0L);
            dto.setTodayMessages(todayMessages != null ? todayMessages : 0L);

            stats.add(dto);
        }

        return stats;
    }
    
    // 기존 메서드들 (호환성 유지)
    @Transactional(readOnly = true)
    public Page<InquiryDto> getInquiries(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        InquiryStatus inquiryStatus = status != null ? InquiryStatus.valueOf(status.toUpperCase()) : null;
        
        Page<Inquiry> inquiries;
        if (inquiryStatus == null) {
            inquiries = inquiryRepository.findAllByOrderByCreatedAtDesc(pageable);
        } else {
            inquiries = inquiryRepository.findByStatusOrderByCreatedAtDesc(inquiryStatus, pageable);
        }
        
        return inquiries.map(this::convertToInquiryDto);
    }
    
    public void respondToInquiry(Long inquiryId, InquiryResponseDto responseDto, String adminName) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
            .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다"));
        
        inquiry.setAnswer(responseDto.getResponse());
        inquiry.setStatus(InquiryStatus.ANSWERED);
        inquiry.setAnsweredAt(LocalDateTime.now());
        
        inquiryRepository.save(inquiry);
    }
    
    public void deleteInquiry(Long inquiryId) {
        inquiryRepository.deleteById(inquiryId);
    }
    
    // DTO 변환 메서드들
    private AdminUserDTO convertToAdminUserDTO(User user) {
        AdminUserDTO dto = new AdminUserDTO();
        
        dto.setId(user.getId());
        dto.setUserId(generateUserId(user.getId(), user.getCreatedAt()));
        dto.setUsername(user.getUsername());
        dto.setNickname(user.getNickname());
        dto.setEmail(user.getEmail());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        
        // roles 안전하게 처리
        if (user.getRoles() != null) {
            dto.setRoles(
                user.getRoles().stream()
                    .map(role -> role.getName() != null ? role.getName().name() : "UNKNOWN")
                    .collect(Collectors.toSet())
            );
        } else {
            dto.setRoles(Set.of());
        }

        // 컬렉션 null-safe 처리
        dto.setInquiryCount(user.getInquiries() != null ? (long) user.getInquiries().size() : 0L);
        dto.setWishlistCount(user.getWishlists() != null ? (long) user.getWishlists().size() : 0L);
        dto.setChatMessageCount(user.getRegionalChats() != null ? (long) user.getRegionalChats().size() : 0L);

        return dto;
    }
    
    private AdminInquiryDTO convertToAdminInquiryDTO(Inquiry inquiry) {
        AdminInquiryDTO dto = new AdminInquiryDTO();
        
        dto.setId(inquiry.getId());
        dto.setInquiryNumber("INQ-" + inquiry.getCreatedAt().getYear() + "-" + String.format("%03d", inquiry.getId()));
        dto.setTitle(inquiry.getTitle());
        dto.setContent(inquiry.getContent());
        dto.setStatus(inquiry.getStatus() != null ? inquiry.getStatus().name() : "PENDING");
        dto.setAnswer(inquiry.getAnswer());
        dto.setCreatedAt(inquiry.getCreatedAt());
        dto.setAnsweredAt(inquiry.getAnsweredAt());
        dto.setAdminAnswer(inquiry.getAnswer()); // adminAnswer와 answer 동일하게 처리
        
        // 사용자 정보 설정
        if (inquiry.getUser() != null) {
            dto.setUserNickname(inquiry.getUser().getNickname());
        } else {
            dto.setUserNickname("익명");
        }
        
        return dto;
    }
    
    private InquiryDto convertToInquiryDto(Inquiry inquiry) {
        return new InquiryDto(
            inquiry.getId(),
            inquiry.getTitle(),
            inquiry.getContent(),
            inquiry.getStatus() != null ? inquiry.getStatus().name() : "PENDING",
            inquiry.getAnswer(),
            inquiry.getCreatedAt(),
            inquiry.getAnsweredAt()
        );
    }
    
    private UserDetailDto convertToUserDetailDto(User user) {
        Set<String> roleNames = user.getRoles() != null ? 
            user.getRoles().stream()
                .map(role -> role.getName() != null ? role.getName().name() : "USER")
                .collect(Collectors.toSet()) :
            Set.of("USER");
        
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