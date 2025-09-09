package com.korea.festival.service;

import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.korea.festival.entity.Role;
import com.korea.festival.entity.RoleName;
import com.korea.festival.entity.User;
import com.korea.festival.repository.RoleRepository;
import com.korea.festival.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Order(1)
@Service
@RequiredArgsConstructor
public class DataInitializationService implements CommandLineRunner {
    
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        initializeRoles();
        initializeAdminUser();
        initializeTestUser();
    }
    
    private void initializeRoles() {
        if (roleRepository.findByName(RoleName.USER).isEmpty()) {
            Role userRole = new Role();
            userRole.setName(RoleName.USER);
            roleRepository.save(userRole);
        }
        
        if (roleRepository.findByName(RoleName.ADMIN).isEmpty()) {
            Role adminRole = new Role();
            adminRole.setName(RoleName.ADMIN);
            roleRepository.save(adminRole);
        }
    }
    
    private void initializeAdminUser() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseThrow(() -> new RuntimeException("Admin role not found"));
            
            User admin = new User();
            admin.setUsername("admin");
            admin.setNickname("관리자");
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("admin123!"));
            admin.setRoles(Set.of(adminRole));
            admin.setIsActive(true);
            
            userRepository.save(admin);
        }
    }
    private void initializeTestUser() {
        if (userRepository.findByUsername("test").isEmpty()) {
            Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new RuntimeException("User role not found"));
            
            User testUser = new User();
            testUser.setUsername("test");
            testUser.setNickname("테스트유저");
            testUser.setEmail("test@example.com");
            testUser.setPassword(passwordEncoder.encode("test123!"));
            testUser.setRoles(Set.of(userRole));
            testUser.setIsActive(true);
            
            userRepository.save(testUser);
        }
    }
    
    
}