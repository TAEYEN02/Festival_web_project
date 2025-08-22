package com.korea.festival.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "wishlists")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Wishlist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String itemType; // 상품 타입 (예: "product", "service", etc.)
    
    @Column(nullable = false)
    private Long itemId; // 찜한 아이템의 ID
    
    @Column(nullable = false)
    private String itemTitle; // 아이템 제목
    
    private String itemImage; // 아이템 이미지 URL
    
    private Integer itemPrice; // 아이템 가격
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
