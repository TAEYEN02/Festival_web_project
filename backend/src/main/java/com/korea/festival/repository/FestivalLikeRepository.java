package com.korea.festival.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.korea.festival.entity.FestivalLikeEntity;
import com.korea.festival.entity.Festival_MainPage;
import com.korea.festival.entity.User;

public interface FestivalLikeRepository extends JpaRepository<FestivalLikeEntity, Long> {
 Optional<FestivalLikeEntity> findByUserAndFestival(User user, Festival_MainPage festival);
 int countByFestival(Festival_MainPage festival);
}
