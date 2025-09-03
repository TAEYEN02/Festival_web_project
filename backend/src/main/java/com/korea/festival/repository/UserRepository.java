package com.korea.festival.repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.korea.festival.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByNickname(String nickname);
    
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);
    
    // 관리자용 쿼리
    Page<User> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    Page<User> findByIsActiveFalseOrderByCreatedAtDesc(Pageable pageable);
    Page<User> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    Long countActiveUsers();
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate AND u.createdAt < :endDate")
    Long countUsersByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT u FROM User u WHERE u.createdAt >= :startDate ORDER BY u.createdAt DESC")
    List<User> findRecentUsers(@Param("startDate") LocalDateTime startDate, Pageable pageable);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles LEFT JOIN FETCH u.inquiries LEFT JOIN FETCH u.wishlists LEFT JOIN FETCH u.regionalChats")
    Page<User> findAllWithRelations(Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE " +
           "(u.username LIKE %:search% OR u.nickname LIKE %:search% OR u.email LIKE %:search%) " +
           "AND (:isActive IS NULL OR u.isActive = :isActive) " +
           "ORDER BY u.createdAt DESC")
    Page<User> findUsersWithSearch(@Param("search") String search, 
                                   @Param("isActive") Boolean isActive, 
                                   Pageable pageable);
    
    // 활성/비활성 사용자 수 카운트
    Long countByIsActiveTrue();
    Long countByIsActiveFalse();
}