package com.example.festival.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 축제 정보 entity
@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "festivals")
public class FestivalEntity {
	
	@Id 
	@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String externalId;  // Visit Korea API 고유 ID

    @Column(nullable = false)
    private String title;       // 축제명

    private LocalDate startDate; // 시작일
    private LocalDate endDate;   // 종료일
    private String location;     // 지역명 또는 주소

    @Column(length = 500)
    private String imageUrl;     // 대표 이미지

    private String description;  // 설명

    @Column(length = 500)
    private String bookingUrl;   // 예매 링크 또는 홈페이지

    private int views;           // 상세 조회수
    private int clicks;          // 예매 클릭수
    
    private boolean active; // 현재 축제 정보가 유효한지

    private LocalDateTime createdAt; // DB 저장 시점
    
    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // 관계 매핑
    @OneToMany(mappedBy = "festival", cascade = CascadeType.ALL)
    private List<FestivalImageEntity> images;

    @OneToMany(mappedBy = "festival", cascade = CascadeType.ALL)
    private List<CommunityPostEntity> posts;
}
