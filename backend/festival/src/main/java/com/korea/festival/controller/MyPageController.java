package com.korea.festival.controller;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.korea.festival.dto.InquiryDto;
import com.korea.festival.dto.RegionalChatDto;
import com.korea.festival.dto.UserProfileDTO;
import com.korea.festival.dto.UserUpdateDto;
import com.korea.festival.dto.WishListDto;
import com.korea.festival.service.InquiryService;
import com.korea.festival.service.RegionalChatService;
import com.korea.festival.service.UserService;
import com.korea.festival.service.WishlistService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
@Validated
public class MyPageController {
    
    private final UserService userService;
    private final InquiryService inquiryService;
    private final WishlistService wishlistService;
    private final RegionalChatService regionalChatService;
    
    // ===== 사용자 프로필 관련 =====
    
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        UserProfileDTO profile = userService.getUserProfile(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }
    
    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateUserProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserUpdateDto updateDTO) {
        UserProfileDTO updated = userService.updateUserProfile(userDetails.getUsername(), updateDTO);
        return ResponseEntity.ok(updated);
    }
    
    // ===== 1대1 문의 관련 =====
    
    @PostMapping("/inquiries")
    public ResponseEntity<InquiryDto> createInquiry(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody InquiryDto inquiryDTO) {
    	InquiryDto created = inquiryService.createInquiry(userDetails.getUsername(), inquiryDTO);
        return ResponseEntity.ok(created);
    }
    
    @GetMapping("/inquiries")
    public ResponseEntity<Page<InquiryDto>> getUserInquiries(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<InquiryDto> inquiries = inquiryService.getUserInquiries(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(inquiries);
    }
    
    @GetMapping("/inquiries/{id}")
    public ResponseEntity<InquiryDto> getInquiry(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        InquiryDto inquiry = inquiryService.getInquiry(userDetails.getUsername(), id);
        return ResponseEntity.ok(inquiry);
    }
    
    // ===== 찜 목록 관련 =====
    
    @PostMapping("/wishlist")
    public ResponseEntity<WishListDto> addToWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> request) {
        String itemType = (String) request.get("itemType");
        Long itemId = Long.valueOf(request.get("itemId").toString());
        String itemTitle = (String) request.get("itemTitle");
        String itemImage = (String) request.get("itemImage");
        Integer itemPrice = request.get("itemPrice") != null ? 
            Integer.valueOf(request.get("itemPrice").toString()) : null;
        
        WishListDto wishlist = wishlistService.addToWishlist(
            userDetails.getUsername(), itemType, itemId, itemTitle, itemImage, itemPrice);
        return ResponseEntity.ok(wishlist);
    }
    
    @DeleteMapping("/wishlist/{itemType}/{itemId}")
    public ResponseEntity<Void> removeFromWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String itemType,
            @PathVariable Long itemId) {
        wishlistService.removeFromWishlist(userDetails.getUsername(), itemType, itemId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/wishlist")
    public ResponseEntity<Page<WishListDto>> getUserWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<WishListDto> wishlist = wishlistService.getUserWishlist(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(wishlist);
    }
    
    @GetMapping("/wishlist/check/{itemType}/{itemId}")
    public ResponseEntity<Map<String, Boolean>> checkWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String itemType,
            @PathVariable Long itemId) {
        boolean isInWishlist = wishlistService.isInWishlist(userDetails.getUsername(), itemType, itemId);
        return ResponseEntity.ok(Map.of("isInWishlist", isInWishlist));
    }
    
    // ===== 지역채팅 관련 =====
    
    @PostMapping("/regional-chat")
    public ResponseEntity<RegionalChatDto> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RegionalChatDto chatDTO) {
    	RegionalChatDto sent = regionalChatService.sendMessage(userDetails.getUsername(), chatDTO);
        return ResponseEntity.ok(sent);
    }
    
    @GetMapping("/regional-chat/{region}")
    public ResponseEntity<Page<RegionalChatDto>> getRegionalMessages(
            @PathVariable String region,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<RegionalChatDto> messages = regionalChatService.getRegionalMessages(region, pageable);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/regional-chat/my-messages")
    public ResponseEntity<Page<RegionalChatDto>> getUserMessages(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<RegionalChatDto> messages = regionalChatService.getUserMessages(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(messages);
    }
    
    @DeleteMapping("/regional-chat/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long messageId) {
        regionalChatService.deleteMessage(userDetails.getUsername(), messageId);
        return ResponseEntity.ok().build();
    }
}
