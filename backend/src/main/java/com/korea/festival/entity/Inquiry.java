package com.korea.festival.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "inquiries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inquiry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InquiryStatus status = InquiryStatus.PENDING;
    
    @Column(columnDefinition = "TEXT")
    private String answer;
    
    @Column(name = "answered_at")
    private LocalDateTime answeredAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(length = 50)
    private String category; // 문의 카테고리 (일반, 결제, 기술지원 등)
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = InquiryStatus.PENDING;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // 답변 완료 처리 메서드
    public void completeAnswer(String answerContent) {
        this.answer = answerContent;
        this.status = InquiryStatus.ANSWERED;
        this.answeredAt = LocalDateTime.now();
    }
    
    // 문의 종료 처리 메서드
    public void close() {
        this.status = InquiryStatus.CLOSED;
    }
    
    // 답변 완료 여부 확인
    public boolean isAnswered() {
        return this.status == InquiryStatus.ANSWERED;
    }
    
    // 답변 대기 여부 확인
    public boolean isPending() {
        return this.status == InquiryStatus.PENDING;
    }
}