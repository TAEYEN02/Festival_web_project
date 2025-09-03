package com.korea.festival.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.korea.festival.entity.Festival_MainPage;
import com.korea.festival.service.MainPageService;

import lombok.RequiredArgsConstructor;

// 메인페이지용 컨트롤러
@RestController
@RequestMapping("/api/festivals")
@RequiredArgsConstructor
public class MainPageController {
	
	
	private final MainPageService mainPageService;
	
	
	// 공공테이터포털 api -> DB 저장 -> DB에서 축제 정보 불러옴
	// http://localhost:8081/api/festivals/import
    @PostMapping("/import")
    public ResponseEntity<String> importFestivals() {
    	mainPageService.importFestivals();
        return ResponseEntity.ok("축제 데이터가 성공적으로 저장되었습니다.");
    }
	
	
	// 최신순 조회
    @GetMapping("/latest")
    public ResponseEntity<List<Festival_MainPage>> getLatestFestivals() {
    	System.out.println("너 들어오니1");
        return ResponseEntity.ok(mainPageService.getFestivalsByLatest());
    }

    // 인기순 조회 (조회수 기준)
    @GetMapping("/popular")
    public ResponseEntity<List<Festival_MainPage>> getPopularFestivals() {
    	System.out.println("너 들어오니2");
        return ResponseEntity.ok(mainPageService.getFestivalsByPopularity());
    }

    // 인기순 조회 (좋아요 기준)
    @GetMapping("/likes")
    public ResponseEntity<List<Festival_MainPage>> getFestivalsByLikes() {
        return ResponseEntity.ok(mainPageService.getFestivalsByLikes());
    }
    
    
	 // 조회수 증가
	 // 조회수 +1
    @PostMapping("/increment-views/{contentId}")
    public ResponseEntity<Void> incrementViews(@PathVariable("contentId") String contentId) {
        mainPageService.incrementViews(contentId);
        return ResponseEntity.ok().build();
    }

    
    
    
    
    
}
