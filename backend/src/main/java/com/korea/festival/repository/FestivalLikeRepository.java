package com.korea.festival.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.korea.festival.entity.FestivalLikeEntity;
import com.korea.festival.entity.Festival_MainPage;
import com.korea.festival.entity.User;

public interface FestivalLikeRepository extends JpaRepository<FestivalLikeEntity, Long> {

	boolean existsByUserAndFestival_ContentId(User user, String contentId);

	Optional<FestivalLikeEntity> findByUserAndFestival_ContentId(User user, String contentId);

	int countByFestival_ContentId(String contentId);
}
