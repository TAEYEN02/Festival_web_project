package com.korea.festival.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.RegionalChatReport;
import com.korea.festival.entity.ReportStatus;

@Repository
public interface RegionalChatReportRepository extends JpaRepository<RegionalChatReport, Long> {
    
    Page<RegionalChatReport> findByStatusOrderByReportedAtDesc(ReportStatus status, Pageable pageable);
    Page<RegionalChatReport> findAllByOrderByReportedAtDesc(Pageable pageable);
    
    @Query("SELECT r FROM RegionalChatReport r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:region IS NULL OR r.message.region = :region)")
    Page<RegionalChatReport> findByFilters(@Param("status") ReportStatus status, 
                                          @Param("region") String region, 
                                          Pageable pageable);
    
    Long countByStatus(ReportStatus status);
    
    // 누락된 메서드 추가
    @Query("SELECT COUNT(r) FROM RegionalChatReport r WHERE r.message.id = :messageId")
    Long countReportsByMessageId(@Param("messageId") Long messageId);
    
    boolean existsByMessageIdAndReporterId(Long messageId, Long reporterId);
}
