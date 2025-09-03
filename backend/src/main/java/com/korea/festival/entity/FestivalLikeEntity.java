package com.korea.festival.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "festival_likes",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "content_id"})
    }
)
@Getter 
@Setter
@NoArgsConstructor 
@AllArgsConstructor
@Builder
public class FestivalLikeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 좋아요를 누른 사용자
    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 좋아요가 눌린 축제
    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "content_id", nullable = false)
    private Festival_MainPage festival;
}

