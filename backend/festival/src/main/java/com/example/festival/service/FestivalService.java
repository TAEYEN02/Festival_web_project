package com.example.festival.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.festival.client.FestivalApiClient;
import com.example.festival.dto.FestivalDTO;
import com.example.festival.entity.FestivalEntity;
import com.example.festival.mapper.FestivalMapper;
import com.example.festival.repository.FestivalRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor // final 필드를 통한 생성자 주입을 사용하기 위해
@Service
public class FestivalService {

	@Autowired
	private final FestivalApiClient festivalApiClient;
    private final FestivalRepository festivalRepository;
    
    
    
    // Tour API에서 목록 조회 (DB 없이)
//    public List<FestivalDTO> getFestivalsFromApi() {
//        String startDate = LocalDate.now().withDayOfYear(1)
//                .format(DateTimeFormatter.ofPattern("yyyyMMdd"));
//        
//        return festivalApiClient.fetchFestivals(startDate);
//    }

    
    // 클릭/상세 조회 시 DB 저장 + DTO 반환
//    public FestivalDTO getFestivalDetailAndSave(String externalId) {
//        FestivalDTO dto = festivalApiClient.fetchFestivalDetail(externalId);
//
//        festivalRepository.findByExternalId(externalId)
//            .orElseGet(() -> festivalRepository.save(FestivalMapper.toEntity(dto)));
//
//        return dto;
//    }
    
//    public FestivalDTO getOrSaveFestival(String externalId) {
//        // 1️⃣ DB에서 먼저 조회
//        Optional<FestivalEntity> optionalFestival = festivalRepository.findByExternalId(externalId);
//        if (optionalFestival.isPresent()) {
//            return FestivalMapper.toDto(optionalFestival.get());
//        }
//
//        // 2️⃣ DB에 없으면 외부 API 조회
//        Map<String, Object> apiData = festivalApiClient.fetchFestivalDetail(externalId);
//
//        // 3️⃣ Map 안전 처리
//        Map<String, Object> response = (Map<String, Object>) apiData.get("response");
//        if (response == null) throw new RuntimeException("API 응답에 response가 없습니다");
//
//        Map<String, Object> body = (Map<String, Object>) response.get("body");
//        if (body == null) throw new RuntimeException("API 응답에 body가 없습니다");
//
//        Map<String, Object> item = (Map<String, Object>) body.get("items");
//        if (item == null) throw new RuntimeException("API 응답에 items가 없습니다");
//
//        // 필드 추출 (null 체크 후 기본값 설정 가능)
//        String title = item.get("title") != null ? item.get("title").toString() : "제목 없음";
//        String location = item.get("location") != null ? item.get("location").toString() : "";
//        LocalDate startDate = item.get("startDate") != null ? item.get("startDate").toString() : "";
//        LocalDate endDate = item.get("endDate") != null ? item.get("endDate").toString() : "";
//        String description = item.get("description") != null ? item.get("description").toString() : "";
//        String homepage = item.get("homepage") != null ? item.get("homepage").toString() : "";
//        String imageUrl = item.get("imageUrl") != null ? item.get("imageUrl").toString() : "";
//
//        // 4️⃣ DTO 생성
//        FestivalDTO dtoFromApi = FestivalDTO.builder()
//                .externalId(externalId)
//                .title(title)
//                .location(location)
//                .startDate(startDate)
//                .endDate(endDate)
//                .description(description)
//                .homepage(homepage)
//                .imageUrl(imageUrl)
//                .build();
//
//        // 5️⃣ Entity로 변환 후 DB 저장
//        FestivalEntity festival = FestivalMapper.toEntity(dtoFromApi);
//        festivalRepository.save(festival);
//
//        return dtoFromApi;
//    }
//
//    
    
    // Tour API → DB 저장 (업데이트 포함)
//    public void updateFestivalsFromApi() {
//        String startDate = LocalDate.now().withDayOfYear(1)
//                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
//        String endDate = LocalDate.now().withDayOfYear(LocalDate.now().lengthOfYear())
//                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
//
//        List<FestivalDTO> festivalList = festivalApiClient.fetchFestivals(startDate);
//
//        for (FestivalDTO dto : festivalList) {
//            festivalRepository.findByExternalId(dto.getExternalId())
//                    .ifPresentOrElse(existing -> {
//                        // 이미 있으면 업데이트
//                        existing.setTitle(dto.getTitle());
//                        existing.setLocation(dto.getLocation());
//                        existing.setImageUrl(dto.getImageUrl());
//                        existing.setStartDate(dto.getStartDate());
//                        existing.setEndDate(dto.getEndDate());
//                        existing.setActive(true);
//                        festivalRepository.save(existing);
//                    }, () -> {
//                        // 없으면 새로 추가
//                        FestivalEntity newFestival = FestivalEntity.builder()
//                                .externalId(dto.getExternalId())
//                                .title(dto.getTitle())
//                                .location(dto.getLocation())
//                                .imageUrl(dto.getImageUrl())
//                                .startDate(dto.getStartDate())
//                                .endDate(dto.getEndDate())
//                                .active(true)
//                                .build();
//                        festivalRepository.save(newFestival);
//                    });
//        }
//    }

    // 최신순 목록
    public List<FestivalDTO> getLatestFestivals() {
        return festivalRepository.findAll()
                .stream()
                .sorted((f1, f2) -> f2.getCreatedAt().compareTo(f1.getCreatedAt()))
                .map(FestivalMapper::toDto)
                .collect(Collectors.toList());
    }

    // 인기순 목록 (조회수 기준)
    public List<FestivalDTO> getPopularFestivals() {
        return festivalRepository.findAll()
                .stream()
                .sorted((f1, f2) -> Integer.compare(f2.getViews(), f1.getViews()))
                .map(FestivalMapper::toDto)
                .collect(Collectors.toList());
    }

    // 상세 조회 + 조회수 증가
//    public FestivalDTO getFestivalDetail(Long id) {
//        FestivalEntity festival = festivalRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Festival not found: " + id));
//        festival.setViews(festival.getViews() + 1);
//        festivalRepository.save(festival);
//        return FestivalMapper.toDto(festival);
//    }

    // 예매 클릭 기록 + URL 반환
    public String recordBookingClick(Long id) {
        FestivalEntity festival = festivalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Festival not found: " + id));
        festival.setClicks(festival.getClicks() + 1);
        festivalRepository.save(festival);
        return festival.getBookingUrl();
    }
    
 // 검색 기능
    public List<FestivalDTO> searchFestivals(String keyword) {
        List<FestivalEntity> entities =
                festivalRepository
                    .search(
                        keyword
                    );

        return entities.stream()
                .map(entity -> FestivalDTO.builder()
                        .id(entity.getId())
                        .title(entity.getTitle())
                        .location(entity.getLocation())
                        .description(entity.getDescription())
                        .startDate(entity.getStartDate())
                        .endDate(entity.getEndDate())
                        .imageUrl(entity.getImageUrl())
                        .build()
                )
                .toList();
    }
}
