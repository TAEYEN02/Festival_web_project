package com.korea.festival.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.korea.festival.jwt.JwtTokenProvider;
import com.korea.festival.service.FestivalLikeService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/festivals")
@RequiredArgsConstructor
public class FestivalLikeController {
    
	private final FestivalLikeService festivalLikeService;
    private final JwtTokenProvider tokenProvider;

    
    // 좋아요 토글
    @PostMapping("/{contentId}/like")
    public ResponseEntity<?> toggleLike(
            @PathVariable("contentId") String contentId,
            HttpServletRequest request
    ) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authorization 헤더 없음 또는 형식 오류");
        }

        String token = authHeader.replace("Bearer ", "");
        if (!tokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("유효하지 않은 토큰");
        }

        String username = tokenProvider.getUsernameFromToken(token);
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("JWT에서 username 추출 실패");
        }

        String result = festivalLikeService.toggleLike(username, contentId);
        int likeCount = festivalLikeService.getLikeCount(contentId);

        return ResponseEntity.ok(Map.of(
                "result", result,
                "likeCount", likeCount
        ));
    }


    // 좋아요 눌렀는지 여부 조회
    @GetMapping("/{contentId}/status")
    public ResponseEntity<?> getLikeStatus(@PathVariable("contentId") String contentId, HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authorization 헤더 없음 또는 형식 오류");
        }

        String token = authHeader.replace("Bearer ", "");
        if (!tokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("유효하지 않은 토큰");
        }

        String username = tokenProvider.getUsernameFromToken(token);
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("JWT에서 username 추출 실패");
        }

        boolean liked = festivalLikeService.isLikedByUser(contentId, username);
        return ResponseEntity.ok(Map.of("liked", liked));
    }

     //좋아요 수 조회 (로그인 필요 없음)
    @GetMapping("/{festivalId}/count")
    public ResponseEntity<?> getLikeCount(@PathVariable("festivalId") String festivalId) {
        try {
            int count = festivalLikeService.getLikeCount(festivalId);
            return ResponseEntity.ok(Map.of("likeCount", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("축제를 찾을 수 없습니다");
        }
    }

    
}
