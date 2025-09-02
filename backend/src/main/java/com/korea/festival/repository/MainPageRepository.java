package com.korea.festival.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.Festival_MainPage;

// 메인페이지용 레포지토리
@Repository
public interface MainPageRepository extends JpaRepository<Festival_MainPage, Long> {
	
	// 최신순 정렬
    List<Festival_MainPage> findTop10ByOrderByStartDateDesc();

    // 인기순 정렬 (조회수 기준)
    List<Festival_MainPage> findAllByOrderByViewsDesc();

    // 인기순 (좋아요 기준)
    List<Festival_MainPage> findTop10ByOrderByLikesCountDesc();
    
    // 축제 중복 체크
    Optional<Festival_MainPage> findByContentId(String contentId);

}
