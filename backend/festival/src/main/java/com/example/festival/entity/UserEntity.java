package com.example.festival.entity;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 회원 정보 entity
@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {
	
	@Id 
	@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;        // 로그인용 이메일

    @Column(nullable = false)
    private String password;     // 암호화 비밀번호

    @Column(nullable = false, unique = true)
    private String nickname;     // 닉네임

    private String role;         // USER / ADMIN 등

    private LocalDateTime createdAt;

    // 관계 매핑
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<CommunityPostEntity> posts;

}
