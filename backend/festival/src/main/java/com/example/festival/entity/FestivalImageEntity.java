package com.example.festival.entity;

import jakarta.persistence.*;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// 축제 후기 사진 entity
@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "festival_images")
public class FestivalImageEntity {
	
	@Id 
	@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "festival_id", nullable = false)
    private FestivalEntity festival;

    @Column(length = 500)
    private String imageUrl;     // 이미지 경로(URL)

}
