package com.korea.festival.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.FestivalLikeEntity;
import com.korea.festival.entity.Festival_MainPage;
import com.korea.festival.entity.User;

@Repository
public interface FestivalLikeRepository extends JpaRepository<FestivalLikeEntity, Long> {

    // 특정 사용자가 특정 축제에 이미 좋아요를 눌렀는지 확인
    boolean existsByUserAndFestival(User user, Festival_MainPage festival);

    
     // 특정 사용자 + 특정 축제 좋아요 엔티티 조회
     // 토글 기능에서 기존 좋아요가 있는지 확인할 때 사용
    Optional<FestivalLikeEntity> findByUserAndFestival(User user, Festival_MainPage festival);

    
     // 특정 사용자와 특정 축제 좋아요 삭제
    void deleteByUserAndFestival(User user, Festival_MainPage festival);

    
     // 특정 축제에 좋아요가 몇 개 눌렸는지 카운트
    int countByFestival(Festival_MainPage festival);
}
