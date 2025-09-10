package com.korea.festival.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.Festival_MainPage;

// 메인페이지용 레포지토리
@Repository
public interface MainPageRepository extends JpaRepository<Festival_MainPage, Long> {
	

	// 앞으로 열릴 축제 최신순
	@Query("SELECT f FROM Festival_MainPage f WHERE f.startDate >= :today ORDER BY f.startDate ASC")
	List<Festival_MainPage> findUpcomingFestivals(@Param("today") LocalDate today);




    // 인기순 정렬 (조회수 기준)
    List<Festival_MainPage> findAllByOrderByViewsDesc();

   
    // 좋아요 기준 상위 10개 가져오기
    List<Festival_MainPage> findTop10ByOrderByLikesCountDesc();
    
    // 축제 중복 체크
    Optional<Festival_MainPage> findByContentId(String contentId);
    
 // contentId 존재 여부 체크 (중복 방지용)
    boolean existsByContentId(String contentId);

}
