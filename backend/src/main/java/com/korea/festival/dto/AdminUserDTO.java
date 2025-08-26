package com.korea.festival.dto;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

import com.korea.festival.entity.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserDTO {
    private Long id;
    private String userId; // USR-2024-101 형태
    private String username;
    private String nickname;
    private String email;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Set<String> roles;
    private Long inquiryCount;
    private Long wishlistCount;
    private Long chatMessageCount;
    
    
    private AdminUserDTO convertToAdminUserDTO(User user) {
        AdminUserDTO dto = new AdminUserDTO();
        
        dto.setId(user.getId());
        dto.setUserId("USR-" + user.getId()); // 기존 형식 유지
        dto.setUsername(user.getUsername());
        dto.setNickname(user.getNickname());
        dto.setEmail(user.getEmail());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        
        // roles 안전하게 변환
        if (user.getRoles() != null) {
            dto.setRoles(
                user.getRoles().stream()
                    .map(role -> role.getName().toString()) // enum → String
                    .collect(Collectors.toSet())
            );
        }

        // LAZY 컬렉션 접근 안전하게 카운트
        dto.setInquiryCount(user.getInquiries() != null ? (long) user.getInquiries().size() : 0L);
        dto.setWishlistCount(user.getWishlists() != null ? (long) user.getWishlists().size() : 0L);
        dto.setChatMessageCount(user.getRegionalChats() != null ? (long) user.getRegionalChats().size() : 0L);

        return dto;
    }
}
