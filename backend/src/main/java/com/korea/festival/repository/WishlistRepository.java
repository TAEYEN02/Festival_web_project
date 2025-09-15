package com.korea.festival.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.User;
import com.korea.festival.entity.Wishlist;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
	
	boolean existsByUserAndItemTypeAndItemId(User user, String itemType, Long itemId);

    void deleteByUserAndItemTypeAndItemId(User user, String itemType, Long itemId);

    Page<Wishlist> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}