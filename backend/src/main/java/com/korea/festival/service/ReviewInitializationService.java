package com.korea.festival.service;

import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import com.korea.festival.entity.Review;
import com.korea.festival.entity.User;
import com.korea.festival.repository.ReviewRepository;
import com.korea.festival.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewInitializationService implements CommandLineRunner {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeSampleReviews();
    }

    private void initializeSampleReviews() {
        User admin = userRepository.findByUsername("admin")
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        User testUser = userRepository.findByUsername("test")
                .orElseThrow(() -> new RuntimeException("Test user not found"));

        if (reviewRepository.count() > 0) return; // 이미 데이터 존재 시 중복 방지

        // 국내 축제 샘플 데이터
        String[] locations = {
            "서울특별시 광진구 강변북로 2273 (자양동)", "부산광역시 수영구 광안해변로 219 (광안동)", "전북특별자치도 전주시 완산구 태조로 44 (풍남동3가)", "강원특별자치도 강릉시 창해로14번길 20-1 (견소동)", 
            "제주특별자치도 서귀포시 남성중로 40 (서홍동)", "대구광역시 북구 엑스코로 10 (산격동)", "인천광역시 연수구 센트럴로 350", "세종특별자치시 조치원읍 새내4길 17", "강원특별자치도 춘천시 중도동", "경상북도 안동시 육사로 239 (운흥동)",
            "전라남도 여수시 선어시장길 6 (중앙동)", "경상북도 포항시 남구 해도동", "강원특별자치도 속초시 해오름로 186 (조양동)", "전남 순천시 순천만길", "경상북도 경주시 노동동"
        };

        String[] titles = {
            "서울 불빛 축제 다녀왔어요",
            "부산 불꽃축제 최고였습니다",
            "전주 한옥마을 전통 축제 체험",
            "강릉 커피축제 특별한 경험",
            "제주 감귤축제에서 먹방",
            "대구 치맥축제 다녀온 후기",
            "인천 펜타포트 락페스티벌 즐기기",
            "광주 비엔날레와 축제 분위기",
            "춘천 마임축제 색다른 경험",
            "안동 국제 탈춤 페스티벌 관람기",
            "여수 밤바다 불꽃놀이 후기",
            "포항 국제불빛축제 감상",
            "속초 설악문화제 즐기기",
            "순천만 갈대축제 힐링",
            "경주 신라문화제 역사 체험"
        };

        String[] contents = {
            "<p>서울 불빛 축제는 가족과 함께하기에 좋았습니다. 다양한 조명 전시가 인상적이었고 사진 찍기에도 완벽했어요.</p>",
            "<p>부산 불꽃축제는 규모가 엄청났습니다. 해운대 앞바다에서 보는 불꽃은 정말 감동적이었어요.</p>",
            "<p>전주 한옥마을 축제에서 전통 체험도 하고, 한복도 입어봤습니다. 사진이 예쁘게 나와서 만족했어요.</p>",
            "<p>강릉 커피축제에서는 수제 커피를 맛볼 수 있었고, 커피 클래스도 참여할 수 있었습니다.</p>",
            "<p>제주 감귤축제에서 감귤 따기 체험을 했는데 아이들이 너무 좋아했습니다.</p>",
            "<p>대구 치맥축제는 먹거리와 공연이 다양해서 하루 종일 즐거웠습니다.</p>",
            "<p>인천 펜타포트 락페스티벌은 열정적인 밴드 무대가 최고였습니다.</p>",
            "<p>광주 비엔날레와 함께 열린 축제에서 문화와 예술을 동시에 느낄 수 있었습니다.</p>",
            "<p>춘천 마임축제는 독특한 공연이 많아 신선했습니다.</p>",
            "<p>안동 탈춤 페스티벌은 세계적으로도 유명하다는데 직접 보니 더 감동적이었어요.</p>",
            "<p>여수 밤바다 불꽃놀이는 낭만적이었습니다. 연인과 함께하기 좋았습니다.</p>",
            "<p>포항 국제불빛축제는 해양 도시 분위기와 어우러져 환상적이었어요.</p>",
            "<p>속초 설악문화제에서는 지역 전통 공연과 먹거리를 동시에 즐길 수 있었습니다.</p>",
            "<p>순천만 갈대밭과 함께하는 갈대축제는 힐링 그 자체였습니다.</p>",
            "<p>경주 신라문화제에서 전통 의상 체험과 퍼레이드가 인상적이었습니다.</p>"
        };

        String[] dates = {
            "20250901", "20250902", "20250903", "20250904", "20250905",
            "20250906", "20250907", "20250908", "20250909", "20250910",
            "20250911", "20250912", "20250913", "20250914", "20250915"
        };
        

        for (int i = 0; i < titles.length; i++) {
            Review review = Review.builder()
                    .location(locations[i])
                    .title(titles[i])
                    .date(dates[i])
                    .content(contents[i])
                    .likes((int)(Math.random() * 50))
                    .view((int)(Math.random() * 200))
                    .user(i % 2 == 0 ? admin : testUser)
                    .tags(Set.of("축제", "샘플", locations[i]))
                    .images(Set.of(""))
                    .build();
            reviewRepository.save(review);
        }
    }
}
