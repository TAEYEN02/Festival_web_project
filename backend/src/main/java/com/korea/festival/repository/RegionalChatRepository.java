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
	
	// 특정 지역(region)의 전체 메시지 조회 (페이징 X, 전체 리스트)
	List<RegionalChat> findByRegion(String region);

	// 특정 지역(region)의 전체 메시지 조회 (페이징 지원)
	Page<RegionalChat> findByRegion(String region, Pageable pageable);
	
	 Page<RegionalChat> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<RegionalChat> findByRegionOrderByCreatedAtDesc(String region, Pageable pageable);

    Page<RegionalChat> findByRegionAndIsHiddenFalseOrderByCreatedAtDesc(String region, Pageable pageable);

    Page<RegionalChat> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    @Query("SELECT r FROM RegionalChat r WHERE " +
           "(:region IS NULL OR r.region = :region) AND " +
           "r.isHidden = false " +
           "ORDER BY r.createdAt DESC")
    Page<RegionalChat> findByRegionWithFilters(@Param("region") String region, Pageable pageable);

    boolean existsByUserAndMessageAndRegionAndCreatedAtAfter(
        User user, String message, String region, LocalDateTime after);

    // 지역별 통계 (주간 데이터)
    @Query("SELECT r.region, COUNT(r), COUNT(DISTINCT r.user), " +
           "COUNT(CASE WHEN r.createdAt >= :today THEN 1 END) " +
           "FROM RegionalChat r WHERE r.createdAt >= :weekAgo AND r.isHidden = false " +
           "GROUP BY r.region")
    List<Object[]> getRegionalMessageStats(@Param("today") LocalDateTime today,
                                          @Param("weekAgo") LocalDateTime weekAgo);

        // 지역별 통계 (전체 데이터)
    @Query("SELECT r.region, COUNT(r), COUNT(DISTINCT r.user), " +
           "COUNT(CASE WHEN r.createdAt >= :today THEN 1 END) " +
           "FROM RegionalChat r WHERE r.isHidden = false " +
           "GROUP BY r.region ORDER BY COUNT(r) DESC")
    List<Object[]> getRegionalMessageStats(@Param("today") LocalDateTime today);

    @Query("SELECT COUNT(r) FROM RegionalChat r WHERE " +
           "r.region = :region AND r.createdAt >= :since")
    Long countByRegionAndCreatedAtAfter(@Param("region") String region,
                                       @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(DISTINCT r.user) FROM RegionalChat r WHERE " +
           "r.region = :region AND r.createdAt >= :since")
    Long countUniqueUsersByRegionAndCreatedAtAfter(@Param("region") String region,
                                                  @Param("since") LocalDateTime since);

    List<RegionalChat> findByUserAndCreatedAtAfterOrderByCreatedAtDesc(
        User user, LocalDateTime after);

    // StatisticsService에서 사용할 메서드들 추가
    
    /**
     * 특정 날짜의 메시지 수 조회
     */
    @Query("SELECT COUNT(r) FROM RegionalChat r WHERE " +
           "r.createdAt >= :startDate AND r.createdAt < :endDate AND r.isHidden = false")
    Long countTodayMessages(@Param("startDate") LocalDateTime startDate, 
                           @Param("endDate") LocalDateTime endDate);
    
    /**
     * 단일 날짜 기준 메시지 수 조회 (하루치)
     */
    @Query("SELECT COUNT(r) FROM RegionalChat r WHERE " +
           "r.createdAt >= :date AND r.createdAt < :nextDate AND r.isHidden = false")
    Long countMessagesByDate(@Param("date") LocalDateTime date, 
                            @Param("nextDate") LocalDateTime nextDate);
    
    /**
     * 활성 채팅 사용자 수 조회 (특정 시점 이후 채팅한 사용자)
     */
    @Query("SELECT COUNT(DISTINCT r.user) FROM RegionalChat r WHERE " +
           "r.createdAt >= :since AND r.isHidden = false")
    Long countActiveChatUsers(@Param("since") LocalDateTime since);
    
    /**
     * 전체 메시지 수 조회 (숨겨지지 않은 메시지만)
     */
    @Query("SELECT COUNT(r) FROM RegionalChat r WHERE r.isHidden = false")
    Long countAllActiveMessages();
    
    /**
     * 특정 기간 동안의 메시지 수 조회
     */
    @Query("SELECT COUNT(r) FROM RegionalChat r WHERE " +
           "r.createdAt >= :startDate AND r.createdAt <= :endDate AND r.isHidden = false")
    Long countMessagesBetweenDates(@Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate);
    
   /**
    * 내용이나 사용자 닉네임 검색도 하고 싶으면 검색하는 거
    */
    @Query("SELECT r FROM RegionalChat r " +
            "WHERE (:region IS NULL OR r.region = :region) " +
            "AND (:search IS NULL OR r.message LIKE %:search% OR r.user.nickname LIKE %:search%)")
     Page<RegionalChat> findByRegionAndSearch(
             @Param("region") String region,
             @Param("search") String search,
             Pageable pageable);
}