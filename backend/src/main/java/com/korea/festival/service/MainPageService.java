package com.korea.festival.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.korea.festival.dto.FestivalDTO_MainPage;
import com.korea.festival.entity.Festival_MainPage;
import com.korea.festival.repository.MainPageRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// 메인페이지용 서비스
@Slf4j
@RequiredArgsConstructor // final 필드를 통한 생성자 주입을 사용하기 위해
@Service
public class MainPageService {
	
	
	private final MainPageRepository mainPageRepository;
	private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
	
	private final String API_URL = "https://apis.data.go.kr/B551011/KorService2/searchFestival2";
    private final String API_KEY = "437d76c0cc52c6e459d60d55ba21fa2b4446b310df80d1a0f2e8ff57f2ed8222"; // 인코딩된 인증키

    
    // 공공데이터에서 불러와 DB에 저장
    @Transactional
    public void importFestivals() {
        LocalDate today = LocalDate.now();
        String startDate = today.format(DateTimeFormatter.BASIC_ISO_DATE); 
        String endDate = "20261231"; 
        int numOfRows = 500;
        int pageNo = 1;
        boolean hasMore = true;

        try {
            while (hasMore) {
                UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(API_URL)
                        .queryParam("serviceKey", API_KEY)
                        .queryParam("numOfRows", numOfRows)
                        .queryParam("pageNo", pageNo)
                        .queryParam("MobileOS", "ETC")
                        .queryParam("MobileApp", "AppTest")
                        .queryParam("_type", "json")
                        .queryParam("eventStartDate", startDate)
                        .queryParam("eventEndDate", endDate)
                        .queryParam("arrange", "A"); // 시작일 오름차순

                ResponseEntity<String> response = restTemplate.getForEntity(builder.toUriString(), String.class);
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode itemsNode = root.path("response").path("body").path("items").path("item");

                if (itemsNode.isMissingNode() || itemsNode.isNull()) {
                    hasMore = false;
                    break;
                }

                List<JsonNode> items = new ArrayList<>();
                if (itemsNode.isArray()) {
                    items = StreamSupport.stream(itemsNode.spliterator(), false).collect(Collectors.toList());
                } else {
                    items.add(itemsNode);
                }

                items.sort(Comparator.comparing(node ->
                        LocalDate.parse(node.path("eventstartdate").asText(), DateTimeFormatter.BASIC_ISO_DATE)));

                for (JsonNode node : items) {
                    String contentId = node.path("contentid").asText();

                    // 이미 존재하면 skip (DB UNIQUE 제약으로도 안전하게 방지됨)
                    boolean exists = mainPageRepository.existsByContentId(contentId);
                    if (exists) continue;

                    Festival_MainPage f = new Festival_MainPage();
                    f.setContentId(contentId);
                    f.setName(node.path("title").asText());
                    f.setLocation(node.path("addr1").asText());
                    f.setStartDate(LocalDate.parse(node.path("eventstartdate").asText(), DateTimeFormatter.BASIC_ISO_DATE));
                    f.setEndDate(LocalDate.parse(node.path("eventenddate").asText(), DateTimeFormatter.BASIC_ISO_DATE));
                    f.setViews(0);
                    f.setClicks(0);
                    f.setCreatedAt(LocalDateTime.now());

                    String image = node.path("firstimage").asText();
                    if (image == null || image.isBlank()) {
                        image = node.path("firstimage2").asText();
                    }
                    if (image == null || image.isBlank()) {
                        image = "/default.jpg";
                    }
                    f.setFirstimage(image);

                    try {
                        mainPageRepository.saveAndFlush(f); // UNIQUE 제약 위반 시 예외 발생 → catch
                    } catch (Exception e) {
                        log.warn("중복 contentId로 저장 건너뜀: {}", contentId);
                    }
                }

                int totalCount = root.path("response").path("body").path("totalCount").asInt();
                if (pageNo * numOfRows >= totalCount) {
                    hasMore = false;
                } else {
                    pageNo++;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("축제 데이터 저장 실패", e);
        }
    }

    
    
    // DB 전체 삭제
    public void deleteAllFestivals() {
        mainPageRepository.deleteAll();
    }

    
    // 최신순
    @Transactional(readOnly = true)
    public List<FestivalDTO_MainPage> getUpcomingFestivalsTop10() {
        LocalDate today = LocalDate.now();
        List<Festival_MainPage> festivals = mainPageRepository.findUpcomingFestivals(today);

        return festivals.stream()
                .limit(10) 
                .map(f -> FestivalDTO_MainPage.builder()
                        .id(f.getId())
                        .contentId(f.getContentId())
                        .name(f.getName())
                        .startDate(f.getStartDate())
                        .endDate(f.getEndDate())
                        .location(f.getLocation())
                        .firstimage(f.getFirstimage())
                        .description(f.getDescription())
                        .bookingUrl(f.getBookingUrl())
                        .views(f.getViews())
                        .clicks(f.getClicks())
                        .likesCount(f.getLikesCount())
                        .createdAt(f.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }




    // 인기순 (조회수 기준)
    public List<Festival_MainPage> getFestivalsByPopularity() {
        return mainPageRepository.findAllByOrderByViewsDesc();
    }

    // 인기순 (좋아요 기준)
    public List<FestivalDTO_MainPage> getFestivalsByLikesDTO() {
        List<Festival_MainPage> list = mainPageRepository.findTop10ByOrderByLikesCountDesc();
        return list.stream()
            .map((Festival_MainPage f) -> FestivalDTO_MainPage.builder()
                .id(f.getId())
                .contentId(f.getContentId())
                .name(f.getName())
                .startDate(f.getStartDate())
                .endDate(f.getEndDate())
                .location(f.getLocation())
                .firstimage(f.getFirstimage())
                .description(f.getDescription())
                .bookingUrl(f.getBookingUrl())
                .views(f.getViews())
                .likesCount(f.getLikesCount())
                .clicks(f.getClicks())
                .createdAt(f.getCreatedAt())
                .build()
            )
            .collect(Collectors.toList());
    }


    
    
    // 조회수 증가
    @Transactional
    public void incrementViews(String contentId) {
        Festival_MainPage festival = mainPageRepository.findByContentId(contentId)
                .orElseThrow(() -> new IllegalArgumentException("해당 축제를 찾을 수 없습니다. contentId=" + contentId));

        festival.setViews(festival.getViews() + 1); // 조회수 +1
        mainPageRepository.save(festival);
    }
}
