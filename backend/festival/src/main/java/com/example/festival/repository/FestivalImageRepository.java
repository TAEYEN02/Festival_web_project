package com.example.festival.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.festival.entity.FestivalEntity;
import com.example.festival.entity.FestivalImageEntity;

@Repository
public interface FestivalImageRepository extends JpaRepository<FestivalImageEntity, Long> {

	// 모든 페스티벌의 사진 조회
    List<FestivalImageEntity> findByFestival(FestivalEntity festival);
}
