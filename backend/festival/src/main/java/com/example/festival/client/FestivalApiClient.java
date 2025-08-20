package com.example.festival.client;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.example.festival.dto.FestivalDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j // 로거 사용
public class FestivalApiClient {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String API_KEY = "2piBNpWzKFccWKcWevKpU314EjNULmxCbZNcuzfUEmPtoKQyO5J%2Bj0J3qI0qWQVWuHCQWxtmYbCwp2OdOl8%2Bxg%3D%3D"; 
    private static final String BASE_URL = "https://apis.data.go.kr/B551011/KorService2/searchFestival2";

    // 축제 목록 조회
    public String getFestivals() throws Exception {
        // 오늘 날짜 기준 YYYYMMDD
        String startDate = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String encodedKey = URLEncoder.encode(API_KEY, StandardCharsets.UTF_8.toString());

        String url = BASE_URL +
                "?serviceKey=" + encodedKey +
                "&MobileOS=ETC" +
                "&MobileApp=MyApp" +
                "&numOfRows=100" +
                "&pageNo=1" +
                "&_type=json" +
                "&eventStartDate=" + startDate +
                "&eventEndDate=20251231";

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        return response.getBody(); // JSON 문자열 그대로 반환
    }
    
    
//    public List<FestivalDTO> fetchFestivals(String startDate) {
//        String url = BASE_URL +
//                "?serviceKey=" + API_KEY +
//                "&MobileOS=ETC" +
//                "&MobileApp=MyApp" +
//                "&numOfRows=100" +
//                "&pageNo=1" +
//                "&_type=json" +
//                "&eventStartDate=" + startDate;
//
//        log.info("API 요청 URL: {}", url);
//
//        try {
//            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
//            log.info("API 응답 상태: {}", response.getStatusCode());
//            log.info("API 응답 본문: {}", response.getBody());
//
//            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
//                List<FestivalDTO> resultList = new ArrayList<>();
//                Map<String, Object> responseMap = (Map<String, Object>) response.getBody().get("response");
//
//                if (responseMap == null) {
//                    log.warn("응답 본문에 'response' 키가 없습니다.");
//                    return Collections.emptyList();
//                }
//
//                Map<String, Object> body = (Map<String, Object>) responseMap.get("body");
//                if (body == null || body.get("items") == null) {
//                    log.info("body 또는 items가 비어있습니다. 응답 데이터 없음.");
//                    return Collections.emptyList();
//                }
//
//                Object itemsObj = ((Map<String, Object>) body.get("items")).get("item");
//                if (itemsObj == null) {
//                    log.info("item이 비어있습니다. 응답 데이터 없음.");
//                    return Collections.emptyList();
//                }
//
//                List<Map<String, Object>> items;
//                if (itemsObj instanceof List) {
//                    items = (List<Map<String, Object>>) itemsObj;
//                } else {
//                    items = new ArrayList<>();
//                    items.add((Map<String, Object>) itemsObj);
//                }
//
//                for (Map<String, Object> item : items) {
//                    try {
//                        FestivalDTO dto = FestivalDTO.builder()
//                                .externalId(String.valueOf(item.get("contentid")))
//                                .title((String) item.get("title"))
//                                .location((String) item.get("addr1"))
//                                .imageUrl((String) item.get("firstimage"))
//                                .startDate(parseDate(String.valueOf(item.get("eventstartdate"))))
//                                .endDate(parseDate(String.valueOf(item.get("eventenddate"))))
//                                .build();
//                        resultList.add(dto);
//                    } catch (Exception e) {
//                        log.error("❌ 데이터 파싱 실패: " + item, e);
//                    }
//                }
//                return resultList;
//            }
//        } catch (Exception e) {
//            log.error("API 호출 중 오류 발생: {}", e.getMessage(), e);
//        }
//        return Collections.emptyList();
//    }
    
    
    // 축제 상세 조회
    public String getFestivalDetail(String contentId) throws Exception {
        String encodedKey = URLEncoder.encode(API_KEY, StandardCharsets.UTF_8.toString());

        String url = BASE_URL +
                "?serviceKey=" + encodedKey +
                "&MobileOS=ETC" +
                "&MobileApp=MyApp" +
                "&_type=json" +
                "&contentId=" + contentId;

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        return response.getBody(); // JSON 그대로 반환
    }

    
//    public FestivalDTO fetchFestivalDetail(String externalId) {
//        // Tour API 4.0은 detail 조회도 searchFestival1에서 contentId로 조회
//        String url = BASE_URL
//                + "?serviceKey=" + API_KEY
//                + "&MobileOS=ETC&MobileApp=AppTest"
//                + "&_type=json"
//                + "&contentId=" + externalId;
//
//        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
//        if (response.getStatusCode() != HttpStatus.OK) return null;
//
//        Map body = (Map) ((Map) response.getBody().get("response")).get("body");
//        if (body == null || body.get("items") == null) return null;
//
//        Object itemObj = ((Map) body.get("items")).get("item");
//        Map<String, Object> itemMap;
//        if (itemObj instanceof Map) {
//            itemMap = (Map<String, Object>) itemObj;
//        } else if (itemObj instanceof List) {
//            itemMap = (Map<String, Object>) ((List) itemObj).get(0);
//        } else {
//            return null;
//        }
//
//        FestivalDTO dto = FestivalDTO.builder()
//                .externalId(itemMap.get("contentid").toString())
//                .title((String) itemMap.get("title"))
//                .location((String) itemMap.get("addr1"))
//                .imageUrl((String) itemMap.get("firstimage"))
//                .startDate(parseDate((String) itemMap.get("eventstartdate")))
//                .endDate(parseDate((String) itemMap.get("eventenddate")))
//                .bookingUrl((String) itemMap.get("homepage"))
//                .description((String) itemMap.get("overview"))
//                .build();
//
//        return dto;
//    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null) return null;
        return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyyMMdd"));
    }
}
