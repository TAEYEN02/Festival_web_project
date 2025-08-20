package com.example.festival.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.festival.entity.FestivalEntity;

@Repository
public interface FestivalRepository extends JpaRepository<FestivalEntity, Long> {
	
	// 외부 API ID로 조회
	Optional<FestivalEntity> findByExternalId(String externalId);
	
	// 검색어로 축제 조회
	@Query("SELECT f FROM FestivalEntity f " +
		       "WHERE LOWER(f.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
		       "OR LOWER(f.location) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
		       "OR LOWER(f.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
		List<FestivalEntity> search(@Param("keyword") String keyword);




}
