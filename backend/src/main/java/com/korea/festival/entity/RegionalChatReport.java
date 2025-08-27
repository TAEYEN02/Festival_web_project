package com.korea.festival.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "regional_chat_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegionalChatReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "message_id", nullable = false)
    private RegionalChat message;
    
    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;
    
    @Column(nullable = false, length = 100)
    private String reason;
    
    @Column(length = 500)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;
    
    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime reportedAt;
    
    private LocalDateTime resolvedAt;
    
    @ManyToOne
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;
    
    private String adminNotes;
}