package com.korea.festival.service;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.korea.festival.dto.SignUpRequest;
import com.korea.festival.dto.UserDetailDto;
import com.korea.festival.dto.UserProfileDTO;
import com.korea.festival.dto.UserUpdateDto;
import com.korea.festival.entity.Role;
import com.korea.festival.entity.RoleName;
import com.korea.festival.entity.User;
import com.korea.festival.oauth.OAuthUserInfo;
import com.korea.festival.repository.RoleRepository;
import com.korea.festival.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService; // 이메일 서비스 추가
    
    // 중복 확인 메서드들
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    @Transactional(readOnly = true)
    public boolean existsByNickname(String nickname) {
        return userRepository.existsByNickname(nickname);
    }
    
    // 회원가입
    public User registerUser(SignUpRequest signUpRequest) {
        // 중복 검사
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new RuntimeException("이미 사용중인 사용자명입니다");
        }
        
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("이미 사용중인 이메일입니다");
        }
        
        if (userRepository.existsByNickname(signUpRequest.getNickname())) {
            throw new RuntimeException("이미 사용중인 닉네임입니다");
        }
        
        // 기본 USER 역할 가져오기
        Role userRole = roleRepository.findByName(RoleName.USER)
            .orElseThrow(() -> new RuntimeException("USER 역할을 찾을 수 없습니다"));
        
        // 새 사용자 생성
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setNickname(signUpRequest.getNickname());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setRoles(Set.of(userRole));
        user.setIsActive(true);
        
        return userRepository.save(user);
    }
    
    // 사용자 상세 정보 조회
    @Transactional(readOnly = true)
    public UserDetailDto getUserDetailByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        return convertToUserDetailDto(user);
    }
    
    // 프로필 조회
    @Transactional(readOnly = true)
    public UserProfileDTO getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        return new UserProfileDTO(
            user.getId(),
            user.getUsername(),
            user.getNickname(),
            user.getEmail(),
            user.getProfileImage(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
    
    // 사용자 정보 수정
    public UserDetailDto updateUser(String username, UserDetailDto updateDto) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        // 닉네임 중복 검사
        if (!user.getNickname().equals(updateDto.getNickname()) &&
            userRepository.existsByNickname(updateDto.getNickname())) {
            throw new RuntimeException("이미 사용중인 닉네임입니다");
        }
        
        // 이메일 중복 검사
        if (!user.getEmail().equals(updateDto.getEmail()) &&
            userRepository.existsByEmail(updateDto.getEmail())) {
            throw new RuntimeException("이미 사용중인 이메일입니다");
        }
        
        user.setNickname(updateDto.getNickname());
        user.setEmail(updateDto.getEmail());
        
        User updatedUser = userRepository.save(user);
        return convertToUserDetailDto(updatedUser);
    }
    
    // 프로필 업데이트 (기존 메서드와 호환)
    public UserProfileDTO updateUserProfile(String username, UserUpdateDto updateDTO) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        // 닉네임 중복 검사
        if (!user.getNickname().equals(updateDTO.getNickname()) &&
            userRepository.existsByNickname(updateDTO.getNickname())) {
            throw new RuntimeException("이미 사용중인 닉네임입니다");
        }
        
        // 이메일 중복 검사
        if (!user.getEmail().equals(updateDTO.getEmail()) &&
            userRepository.existsByEmail(updateDTO.getEmail())) {
            throw new RuntimeException("이미 사용중인 이메일입니다");
        }
        
        // 비밀번호 변경 시 현재 비밀번호 확인
        if (updateDTO.getNewPassword() != null && !updateDTO.getNewPassword().isEmpty()) {
            if (updateDTO.getCurrentPassword() == null ||
                !passwordEncoder.matches(updateDTO.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("현재 비밀번호가 일치하지 않습니다");
            }
            user.setPassword(passwordEncoder.encode(updateDTO.getNewPassword()));
        }
        
        user.setNickname(updateDTO.getNickname());
        user.setEmail(updateDTO.getEmail());
        
        User updatedUser = userRepository.save(user);
        
        return new UserProfileDTO(
            updatedUser.getId(),
            updatedUser.getUsername(),
            updatedUser.getNickname(),
            updatedUser.getEmail(),
            updatedUser.getProfileImage(),
            updatedUser.getCreatedAt(),
            updatedUser.getUpdatedAt()
        );
    }
    
    //이미지 업로드
    @Transactional
    public void updateProfileImage(String username, String profileImagePath) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("사용자 없음"));
            user.setProfileImage(profileImagePath);
            userRepository.save(user);
        } catch (Exception e) {
            e.printStackTrace(); // 예외 확인
            throw e;
        }
    }
    
    // DTO 변환 헬퍼 메서드
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
    
    
    public User findOrCreateOAuthUser(OAuthUserInfo userInfo, String provider) {
        Optional<User> optionalUser = userRepository.findByProviderAndProviderId(provider, userInfo.getProviderId());

        if (optionalUser.isPresent()) {
            return optionalUser.get();
        }

        // 신규 사용자 생성
        Role userRole = roleRepository.findByName(RoleName.USER)
            .orElseThrow(() -> new RuntimeException("USER 역할을 찾을 수 없습니다"));

        User newUser = new User();
        newUser.setUsername(provider + "_" + userInfo.getProviderId());
        newUser.setEmail(userInfo.getEmail());
        newUser.setNickname(userInfo.getNickname());
        newUser.setProvider(provider);              // User에 필드 추가 필요
        newUser.setProviderId(userInfo.getProviderId()); // User에 필드 추가 필요
        newUser.setRoles(Set.of(userRole));
        newUser.setIsActive(true);

        return userRepository.save(newUser);
    }
    /**
     * OAuth 로그인 시 Spring Security Authentication 객체 생성
     */
    public Authentication getAuthentication(User user) {
        return new UsernamePasswordAuthenticationToken(
            user.getUsername(),
            null,
            user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList())
        );
    }
// ===== 아이디/비밀번호 찾기 관련 메서드들 =====
    
    /**
     * 이메일로 아이디 찾기
     */
    @Transactional(readOnly = true)
    public String findUsernameByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("해당 이메일로 가입된 계정을 찾을 수 없습니다"));
        
        return user.getUsername();
    }
    
    /**
     * 비밀번호 재설정 (임시 비밀번호 발송)
     */
    public void resetPassword(String username, String email) {
        // 사용자 정보 확인
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("해당 아이디로 가입된 계정을 찾을 수 없습니다"));
        
        // 이메일 일치 확인
        if (!user.getEmail().equals(email)) {
            throw new RuntimeException("입력하신 이메일과 가입된 이메일이 일치하지 않습니다");
        }
        
        // OAuth 계정인 경우 비밀번호 재설정 불가
        if (user.getProvider() != null) {
            throw new RuntimeException("소셜 로그인 계정은 비밀번호 재설정이 불가능합니다. " + 
                                     user.getProvider() + " 계정으로 로그인해주세요");
        }
        
        // 임시 비밀번호 생성 (8자리 영문+숫자)
        String tempPassword = generateTempPassword();
        
        // 비밀번호 업데이트
        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);
        
        // 이메일 발송
        try {
            emailService.sendTempPassword(email, username, tempPassword);
        } catch (Exception e) {
            // 이메일 발송 실패 시 비밀번호 롤백
            throw new RuntimeException("이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요");
        }
    }
    
    /**
     * 임시 비밀번호 생성
     */
    private String generateTempPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder tempPassword = new StringBuilder();
        
        // 8자리 랜덤 생성
        for (int i = 0; i < 8; i++) {
            int index = (int) (Math.random() * chars.length());
            tempPassword.append(chars.charAt(index));
        }
        
        return tempPassword.toString();
    }
    
    /**
     * 비밀번호 변경 (디버깅 포함)
     */
    public void changePassword(String username, String currentPassword, String newPassword) {
        System.out.println("=== UserService.changePassword 시작 ===");
        System.out.println("사용자명: " + username);
        System.out.println("현재 비밀번호 길이: " + (currentPassword != null ? currentPassword.length() : "null"));
        System.out.println("새 비밀번호 길이: " + (newPassword != null ? newPassword.length() : "null"));
        
        try {
            // 사용자 정보 확인
            System.out.println("사용자 조회 중...");
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
            
            System.out.println("사용자 찾음: " + user.getUsername());
            System.out.println("Provider: " + user.getProvider());
            
            // OAuth 계정인 경우 비밀번호 변경 불가
            if (user.getProvider() != null) {
                System.out.println("OAuth 계정이므로 비밀번호 변경 불가");
                throw new RuntimeException("소셜 로그인 계정은 비밀번호를 변경할 수 없습니다");
            }
            
            // 현재 비밀번호 확인
            System.out.println("현재 비밀번호 확인 중...");
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                System.out.println("현재 비밀번호 불일치");
                throw new RuntimeException("현재 비밀번호가 일치하지 않습니다");
            }
            
            System.out.println("현재 비밀번호 확인 완료");
            
            // 새 비밀번호 유효성 검사
            if (newPassword == null || newPassword.length() < 8) {
                System.out.println("새 비밀번호 길이 부족");
                throw new RuntimeException("새 비밀번호는 8자 이상이어야 합니다");
            }
            
            // 현재 비밀번호와 새 비밀번호가 같은지 확인
            if (passwordEncoder.matches(newPassword, user.getPassword())) {
                System.out.println("새 비밀번호가 현재 비밀번호와 동일");
                throw new RuntimeException("새 비밀번호는 현재 비밀번호와 달라야 합니다");
            }
            
            // 비밀번호 변경
            System.out.println("비밀번호 암호화 및 저장 중...");
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            System.out.println("비밀번호 변경 완료!");
            
        } catch (Exception e) {
            System.err.println("changePassword 메서드에서 오류 발생: " + e.getMessage());
            e.printStackTrace();
            throw e; // 다시 던져서 컨트롤러에서 처리하도록
        }
    }
}