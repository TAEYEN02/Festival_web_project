package com.korea.festival.service;

import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.korea.festival.entity.Role;
import com.korea.festival.entity.RoleName;
import com.korea.festival.entity.User;
import com.korea.festival.repository.RoleRepository;
import com.korea.festival.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitService implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        createAdminUser();
    }
    
    private void initializeRoles() {
        // USER 역할 생성
        if (roleRepository.findByName(RoleName.USER).isEmpty()) {
            Role userRole = new Role();
            userRole.setName(RoleName.USER);
            roleRepository.save(userRole);
            log.info("USER 역할이 생성되었습니다.");
        }
        
        // ADMIN 역할 생성
        if (roleRepository.findByName(RoleName.ADMIN).isEmpty()) {
            Role adminRole = new Role();
            adminRole.setName(RoleName.ADMIN);
            roleRepository.save(adminRole);
            log.info("ADMIN 역할이 생성되었습니다.");
        }
    }
    
    private void createAdminUser() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseThrow(() -> new RuntimeException("ADMIN 역할을 찾을 수 없습니다"));
            
            User admin = new User();
            admin.setUsername("admin");
            admin.setNickname("관리자");
            admin.setEmail("admin@festival.com");
            admin.setPassword(passwordEncoder.encode("admin123!"));
            admin.setRoles(Set.of(adminRole));
            admin.setIsActive(true);
            
            userRepository.save(admin);
            log.info("관리자 계정이 생성되었습니다. (username: admin, password: admin123!)");
        }
    }
}

