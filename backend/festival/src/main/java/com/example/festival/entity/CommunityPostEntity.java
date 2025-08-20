package com.example.festival.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 축제 후기 entity
@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "community_posts")
public class CommunityPostEntity {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // PK 자동 증가
    private Long id;

    @ManyToOne
    @JoinColumn(name = "festival_id", nullable = false)
    private FestivalEntity festival;   // 어떤 축제 글인지

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;           // 작성자

    @Lob
    private String content;      // 글 내용

    private LocalDateTime createdAt;

}
