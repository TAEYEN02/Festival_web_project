package com.example.festival.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.festival.client.FestivalApiClient;
import com.example.festival.dto.FestivalDTO;
import com.example.festival.repository.FestivalRepository;
import com.example.festival.service.FestivalService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/festivals")
@RequiredArgsConstructor
public class FestivalController {
	
	@Autowired
	private final FestivalApiClient festivalApiClient;
	private final FestivalService festivalService;
	private final FestivalRepository festivalRepository;
	
	// DB에서 불러오기
//    @GetMapping("/all")
//    public ResponseEntity<List<FestivalEntity>> getFestivals() {
//        return ResponseEntity.ok(festivalService.getFestivals());
//    }
	
	// DB 없이 Tour API에서 가져오는 최신/인기 축제
	@GetMapping("/api/festivals")
    public String fetchFestivals() {
        try {
            return festivalApiClient.getFestivals();
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"API 호출 실패\"}";
        }
    }
	
	
	@GetMapping("/detail/{contentId}")
    public String fetchFestivalDetail(@RequestParam("contentId") String contentId) {
        try {
            return festivalApiClient.getFestivalDetail(contentId);
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"상세조회 실패\"}";
        }
    }
	
	// 클릭 시 상세 조회 + DB 저장
	// 외부 ID로 조회 + DB 저장 → 신규 데이터 처리용
//	@GetMapping("/{externalId}")
//	public ResponseEntity<FestivalDTO> getOrSaveFestival(@PathVariable("externalId") String externalId) {
//	    FestivalDTO festivalDTO = festivalService.getOrSaveFestival(externalId);
//	    return ResponseEntity.ok(festivalDTO);
//	}

    // 관리자 전용: API에서 최신 데이터 받아와 DB 업데이트
//    @PostMapping("/update")
//    public ResponseEntity<String> updateFestivals() {
//        festivalService.updateFestivalsFromApi();
//        return ResponseEntity.ok("축제 정보가 업데이트되었습니다.");
//    }
    

    // DB 기반 최신순/인기순
    @GetMapping
    public ResponseEntity<List<FestivalDTO>> getFestivals(
            @RequestParam(value = "sort", defaultValue = "latest") String sort
    ) {
        List<FestivalDTO> festivals;
        if ("popular".equalsIgnoreCase(sort)) {
            festivals = festivalService.getPopularFestivals();
        } else {
            festivals = festivalService.getLatestFestivals();
        }
        return ResponseEntity.ok(festivals);
    }
    

    // 상세 조회
    // DB에 있는 ID로 조회 → 이미 저장된 데이터 조회용
//    @GetMapping("/{id}")
//    public ResponseEntity<FestivalDTO> getFestivalDetail(@PathVariable("id") Long id) {
//        FestivalDTO festivalDTO = festivalService.getFestivalDetail(id);
//        return ResponseEntity.ok(festivalDTO);
//    }

    // 예매 클릭 기록 + 예매 URL 반환
    @PostMapping("/{id}/click")
    public ResponseEntity<String> clickBooking(@PathVariable("id") Long id) {
        String bookingUrl = festivalService.recordBookingClick(id);
        return ResponseEntity.ok(bookingUrl);
    }
    
    // 검색 기능
    @GetMapping("/search")
    public ResponseEntity<List<FestivalDTO>> searchFestivals(@RequestParam("keyword") String keyword) {
        return ResponseEntity.ok(festivalService.searchFestivals(keyword));
    }
}
