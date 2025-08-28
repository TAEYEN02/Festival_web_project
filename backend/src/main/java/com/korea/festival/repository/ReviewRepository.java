package com.korea.festival.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long>{
	

}
