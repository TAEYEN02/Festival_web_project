package com.korea.festival.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.korea.festival.dto.FestivalDTO_MainPage;
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
    
    // DB 전체 삭제
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFestivals() {
        mainPageService.deleteAllFestivals();
        return ResponseEntity.ok("모든 축제 데이터가 삭제되었습니다.");
    }
    
    // delete 후 import
    @PostMapping("/reset-and-import")
    public ResponseEntity<String> resetAndImportFestivals() {
        try {
            mainPageService.deleteAllFestivals();  // DB 전체 삭제
            mainPageService.importFestivals();     // 최신 데이터 가져오기
            return ResponseEntity.ok("DB 초기화 후 최신 축제 데이터를 가져왔습니다.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("축제 데이터 초기화 및 가져오기 실패");
        }
    }
	
	
	// 최신순 조회
    @GetMapping("/latest")
    public ResponseEntity<List<Festival_MainPage>> getUpcomingFestivalsTop10() {
        List<Festival_MainPage> festivals = mainPageService.getUpcomingFestivalsTop10();
        return ResponseEntity.ok(festivals);
    }

    
    // 인기순 조회 (조회수 기준)
    @GetMapping("/popular")
    public ResponseEntity<List<Festival_MainPage>> getPopularFestivals() {
    	
        return ResponseEntity.ok(mainPageService.getFestivalsByPopularity());
    }

    // 인기순 조회 (좋아요 기준)
    @GetMapping("/likes")
    public ResponseEntity<List<FestivalDTO_MainPage>> getFestivalsByLikes() {
        List<FestivalDTO_MainPage> festivals = mainPageService.getFestivalsByLikesDTO();
        return ResponseEntity.ok(festivals);
    }

    
    
	 // 조회수 증가
	 // 조회수 +1
    @PostMapping("/increment-views/{contentId}")
    public ResponseEntity<Void> incrementViews(@PathVariable("contentId") String contentId) {
        mainPageService.incrementViews(contentId);
        return ResponseEntity.ok().build();
    }

    
    
    
    
    
}
