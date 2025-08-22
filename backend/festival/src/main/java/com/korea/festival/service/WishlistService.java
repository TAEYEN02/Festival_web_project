package com.korea.festival.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.korea.festival.dto.WishListDto;
import com.korea.festival.entity.User;
import com.korea.festival.entity.Wishlist;
import com.korea.festival.repository.UserRepository;
import com.korea.festival.repository.WishlistRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class WishlistService {
    
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    
    public WishListDto addToWishlist(String username, String itemType, Long itemId, 
                                   String itemTitle, String itemImage, Integer itemPrice) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        if (wishlistRepository.existsByUserAndItemTypeAndItemId(user, itemType, itemId)) {
            throw new RuntimeException("이미 찜 목록에 추가된 상품입니다");
        }
        
        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setItemType(itemType);
        wishlist.setItemId(itemId);
        wishlist.setItemTitle(itemTitle);
        wishlist.setItemImage(itemImage);
        wishlist.setItemPrice(itemPrice);
        
        Wishlist saved = wishlistRepository.save(wishlist);
        return convertToDTO(saved);
    }
    
    public void removeFromWishlist(String username, String itemType, Long itemId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        wishlistRepository.deleteByUserAndItemTypeAndItemId(user, itemType, itemId);
    }
    
    @Transactional(readOnly = true)
    public Page<WishListDto> getUserWishlist(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        return wishlistRepository.findByUserOrderByCreatedAtDesc(user, pageable)
            .map(this::convertToDTO);
    }
    
    @Transactional(readOnly = true)
    public boolean isInWishlist(String username, String itemType, Long itemId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        return wishlistRepository.existsByUserAndItemTypeAndItemId(user, itemType, itemId);
    }
    
    private WishListDto convertToDTO(Wishlist wishlist) {
        return new WishListDto(
            wishlist.getId(),
            wishlist.getItemType(),
            wishlist.getItemId(),
            wishlist.getItemTitle(),
            wishlist.getItemImage(),
            wishlist.getItemPrice(),
            wishlist.getCreatedAt()
        );
    }
}
