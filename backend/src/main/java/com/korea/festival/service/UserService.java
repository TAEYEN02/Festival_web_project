package com.korea.festival.service;

import com.korea.festival.dto.SignUpRequest;
import com.korea.festival.dto.UserDetailDto;
import com.korea.festival.entity.Role;
import com.korea.festival.entity.User;
import com.korea.festival.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder; 

    public User registerUser(SignUpRequest signUpRequest) {
        if (userRepository.findByUsername(signUpRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken!");
        }

        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email Address already in use!");
        }

        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setNickname(signUpRequest.getNickname());

        if (signUpRequest.getRole() != null && signUpRequest.getRole().equals("ADMIN")) {
            user.setRole(Role.ADMIN);
        } else {
            user.setRole(Role.USER);
        }

        return userRepository.save(user);
    }
    
    public UserDetailDto getUserDetailByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return new UserDetailDto(user);
    }

    public UserDetailDto updateUser(String username, UserDetailDto dto) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        user.setNickname(dto.getNickname());
        user.setPhoneNumber(dto.getPhoneNumber());
        // 필요 시 이메일, 비밀번호 변경 로직 추가
        userRepository.save(user);
        return new UserDetailDto(user);
    }
}
   