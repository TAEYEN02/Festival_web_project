package com.korea.festival.repository;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.Inquiry;
import com.korea.festival.entity.InquiryStatus;
import com.korea.festival.entity.User;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    Page<Inquiry> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    // 관리자용 쿼리
    Page<Inquiry> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Inquiry> findByStatusOrderByCreatedAtDesc(InquiryStatus status, Pageable pageable);
    
    @Query("SELECT COUNT(i) FROM Inquiry i WHERE i.status = :status")
    Long countByStatus(@Param("status") InquiryStatus status);
    
    @Query("SELECT COUNT(i) FROM Inquiry i WHERE i.createdAt >= :startDate AND i.createdAt < :endDate")
    Long countInquiriesByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}

