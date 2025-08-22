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
            updatedUser.getCreatedAt(),
            updatedUser.getUpdatedAt()
        );
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
}
