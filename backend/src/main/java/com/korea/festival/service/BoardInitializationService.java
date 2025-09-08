package com.korea.festival.service;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import com.korea.festival.entity.Board;
import com.korea.festival.entity.User;
import com.korea.festival.repository.BoardRepository;
import com.korea.festival.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardInitializationService implements CommandLineRunner {

	//게시판 샘플 데이터	
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeSampleBoards();
    }

    private void initializeSampleBoards() {
        User admin = userRepository.findByUsername("admin")
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        User testUser = userRepository.findByUsername("test")
                .orElseThrow(() -> new RuntimeException("Test user not found"));

        if (boardRepository.count() > 0) return; // 이미 데이터 존재 시 중복 방지

        // 잡담 카테고리 샘플
        String[] chatTitles = {
            "서울 축제 다녀왔는데 음식이 너무 맛있었어요!",
            "부산 불꽃축제, 날씨만 괜찮으면 완벽할 것 같아요",
            "전주 한옥마을 축제, 사진 찍기 좋은 장소 추천해주세요",
            "강릉 커피축제에서 발견한 새로운 커피 맛 공유",
            "축제 가면 꼭 먹어야 하는 길거리 음식 TOP 5"
        };

        String[] chatContents = {
            "<p>지난 주말 서울에서 열린 축제에 다녀왔습니다. 음식 부스가 정말 많았고, 특히 전통 음식들이 너무 맛있더라고요. 다양한 체험 부스도 있어서 하루 종일 즐겁게 보냈습니다.</p>",
            "<p>이번 주말 부산 불꽃축제를 보러 갈 예정인데 날씨가 걱정됩니다. 바닷가라 바람이 많이 불 것 같아요. 혹시 야경 촬영 팁 아시는 분 계신가요?</p>",
            "<p>전주 한옥마을 축제에서 사진 찍으려고 하는데, 사람들이 붐비지 않는 포인트가 궁금합니다. 추천 장소가 있다면 알려주세요. 주변 카페도 같이 추천해주시면 감사해요.</p>",
            "<p>강릉 커피축제에서 여러 새로운 커피를 시음해봤습니다. 특히 수제 라떼가 인상적이었어요. 다음에는 친구들과 함께 참여하고 싶습니다.</p>",
            "<p>축제에 가면 꼭 먹어야 하는 길거리 음식을 정리해봤습니다. 떡볶이, 순대, 핫도그 등 기본 메뉴도 좋지만, 지역 특산물도 놓치면 안 되겠네요.</p>"
        };

        for (int i = 0; i < chatContents.length; i++) {
            Board board = Board.builder()
                    .category("잡담")
                    .title(chatTitles[i])
                    .content(chatContents[i])
                    .likes(0)
                    .view(0)
                    .user(i % 2 == 0 ? admin : testUser)
                    .tags(List.of("잡담", "샘플", "축제"))
                    .build();
            boardRepository.save(board);
        }

        // 질문 카테고리 샘플
        String[] questionTitles = {
            "서울 가을 축제 추천 부탁드려요",
            "부산 해변축제, 아이와 함께 가기 좋은 팁?",
            "전주 축제에서 편리한 주차 장소가 있을까요?",
            "축제 참여 시 미리 예약해야 하는 행사 있을까요?",
            "강릉 커피축제 티켓 가격 및 이벤트 정보 문의"
        };

        String[] questionContents = {
            "<p>서울의 가을 축제 중 추천할 만한 곳이 있을까요? 사진 찍기 좋고 가족과 함께 즐길 수 있는 장소를 찾고 있습니다. 경험 있으신 분들의 조언 부탁드려요.</p>",
            "<p>이번에 부산 해변축제에 아이와 함께 가려고 하는데, 아이와 함께 즐기기 좋은 부스나 프로그램이 있는지 알고 싶습니다. 안전하게 즐길 방법도 공유해주시면 감사해요.</p>",
            "<p>전주 축제 방문 예정인데, 주차가 항상 문제인 것 같아요. 근처 편리한 주차장이나 대중교통으로 가는 팁 있으신가요? 미리 계획하고 싶습니다.</p>",
            "<p>축제 참여 시 미리 예약해야 하는 공연이나 체험 부스가 있는지 알고 싶습니다. 예약 없이 가면 못 즐기는 프로그램이 있는지 궁금합니다.</p>",
            "<p>강릉 커피축제 티켓 가격이 얼마인지, 사전에 예약해야 하는 이벤트가 있는지 아시는 분 계신가요? 다양한 커피 시음 프로그램도 미리 확인하고 싶습니다.</p>"
        };

        for (int i = 0; i < questionContents.length; i++) {
            Board board = Board.builder()
                    .category("질문")
                    .title(questionTitles[i])
                    .content(questionContents[i])
                    .likes((int)(Math.random() * 20))
                    .view((int)(Math.random() * 100))
                    .user(i % 2 == 0 ? testUser : admin)
                    .tags(List.of("질문", "샘플", "축제"))
                    .build();
            boardRepository.save(board);
        }
    }
}
