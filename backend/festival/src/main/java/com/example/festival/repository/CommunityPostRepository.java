package com.example.festival.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.festival.entity.CommunityPostEntity;
import com.example.festival.entity.FestivalEntity;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPostEntity, Long> {

    // 특정 축제의 모든 게시글 조회
    List<CommunityPostEntity> findByFestival(FestivalEntity festival);
}