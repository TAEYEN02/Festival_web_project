package com.korea.festival.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.RegionalChat;
import com.korea.festival.entity.User;

@Repository
public interface RegionalChatRepository extends JpaRepository<RegionalChat, Long> {
    Page<RegionalChat> findByRegionAndIsActiveTrueOrderByCreatedAtDesc(String region, Pageable pageable);
    Page<RegionalChat> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // 관리자용 쿼리
    @Query("SELECT COUNT(DISTINCT r.user) FROM RegionalChat r WHERE r.createdAt >= :startDate AND r.isActive = true")
    Long countActiveChatUsers(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT r.region, COUNT(r), COUNT(DISTINCT r.user), " +
           "SUM(CASE WHEN r.createdAt >= :todayStart THEN 1 ELSE 0 END) " +
           "FROM RegionalChat r WHERE r.isActive = true " +
           "GROUP BY r.region ORDER BY COUNT(r) DESC")
    List<Object[]> getRegionalChatStats(@Param("todayStart") LocalDateTime todayStart);
    
    @Query("SELECT COUNT(r) FROM RegionalChat r WHERE r.createdAt >= :startDate AND r.isActive = true")
    Long countTodayMessages(@Param("startDate") LocalDateTime startDate);
}