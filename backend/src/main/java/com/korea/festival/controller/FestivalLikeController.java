package com.korea.festival.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.korea.festival.dto.FestivalLikeDTO;
import com.korea.festival.entity.User;
import com.korea.festival.service.FestivalLikeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/festivals")
@RequiredArgsConstructor
public class FestivalLikeController {
    
	private final FestivalLikeService likeService;

	// 좋아요 토글
    @PostMapping("/{festivalId}/like")
    public FestivalLikeDTO toggleLike(
            @PathVariable Long festivalId,
            @AuthenticationPrincipal User user) { // UserEntity 바로 받기
        return likeService.toggleLike(festivalId, user.getId());
    }

    // 좋아요 상태 + 개수 조회
    @GetMapping("/{festivalId}/like-status")
    public FestivalLikeDTO getLikeStatus(
            @PathVariable Long festivalId,
            @AuthenticationPrincipal User user) {
        return likeService.getLikeStatus(festivalId, user.getId());
    }

    
    // 좋아요 개수 조회
    @GetMapping("/count")
    public long getLikes(@PathVariable Long festivalId) {
        return likeService.countLikes(festivalId);
    }
}
