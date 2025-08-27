package com.korea.festival.handler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.korea.festival.dto.RegionalChatDto;
import com.korea.festival.entity.RegionalChat;
import com.korea.festival.entity.RegionalChatReport;
import com.korea.festival.service.RegionalChatService;
import com.korea.festival.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final RegionalChatService regionalChatService;
    private final UserService userService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 지역별 세션 관리
    private final Map<String, CopyOnWriteArraySet<WebSocketSession>> regionSessions = new ConcurrentHashMap<>();
    
    // 세션별 사용자 정보
    private final Map<String, UserSession> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.info("WebSocket 연결 성공: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            JsonNode jsonNode = objectMapper.readTree(message.getPayload());
            String messageType = jsonNode.get("type").asText();
            
            log.info("메시지 타입: {}, 세션: {}", messageType, session.getId());

            switch (messageType) {
                case "JOIN_REGION":
                    handleJoinRegion(session, jsonNode);
                    break;
                case "LEAVE_REGION":
                    handleLeaveRegion(session);
                    break;
                case "SEND_MESSAGE":
                    handleSendMessage(session, jsonNode);
                    break;
                case "DELETE_MESSAGE":
                    handleDeleteMessage(session, jsonNode);
                    break;
                case "REPORT_MESSAGE":
                    handleReportMessage(session, jsonNode);
                    break;
                default:
                    log.warn("알 수 없는 메시지 타입: {}", messageType);
            }
        } catch (Exception e) {
            log.error("메시지 처리 중 오류 발생", e);
            sendErrorMessage(session, "메시지 처리 중 오류가 발생했습니다.");
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        log.info("WebSocket 연결 종료: {}, 상태: {}", session.getId(), status);
        handleLeaveRegion(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket 전송 오류: " + session.getId(), exception);
        handleLeaveRegion(session);
    }

    private void handleJoinRegion(WebSocketSession session, JsonNode jsonNode) throws Exception {
        String region = getSafeText(jsonNode, "region");
        Long userId = getSafeLong(jsonNode, "userId");
        String nickname = getSafeText(jsonNode, "nickname");
        String username = getSafeText(jsonNode, "username");

        if (region == null || userId == null || nickname == null || username == null) {
            sendErrorMessage(session, "JOIN_REGION 필수 값 누락");
            return;
        }

        // 기존 지역에서 나가기
        handleLeaveRegion(session);

        // 새 지역에 참가
        regionSessions.computeIfAbsent(region, k -> new CopyOnWriteArraySet<>()).add(session);
        userSessions.put(session.getId(), new UserSession(userId, username, nickname, region));

        log.info("사용자 {}({})가 {} 지역에 입장", nickname, userId, region);

        sendRecentMessages(session, region);
        broadcastUserCount(region);
    }

    private String getSafeText(JsonNode node, String key) {
        JsonNode value = node.get(key);
        return (value != null && !value.isNull()) ? value.asText() : null;
    }

    private Long getSafeLong(JsonNode node, String key) {
        JsonNode value = node.get(key);
        return (value != null && value.isNumber()) ? value.asLong() : null;
    }

    private void handleLeaveRegion(WebSocketSession session) {
        UserSession userSession = userSessions.remove(session.getId());
        if (userSession != null) {
            String region = userSession.getRegion();
            CopyOnWriteArraySet<WebSocketSession> sessions = regionSessions.get(region);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    regionSessions.remove(region);
                }
                log.info("사용자 {}가 {} 지역에서 퇴장", userSession.getNickname(), region);
                broadcastUserCount(region);
            }
        }
    }

    private void handleSendMessage(WebSocketSession session, JsonNode jsonNode) throws Exception {
        UserSession userSession = userSessions.get(session.getId());
        if (userSession == null) {
            sendErrorMessage(session, "지역에 입장하지 않았습니다.");
            return;
        }

        String content = jsonNode.get("content").asText();
        String region = jsonNode.get("region").asText();

        // 메시지 길이 검증
        if (content.length() > 500) {
            sendErrorMessage(session, "메시지는 500자를 초과할 수 없습니다.");
            return;
        }

        // 욕설 필터링 (기본적인 검증)
        if (containsInappropriateContent(content)) {
            sendErrorMessage(session, "부적절한 내용이 포함되어 있습니다.");
            return;
        }

        try {
            // 메시지 저장
            RegionalChatDto chatDto = new RegionalChatDto();
            chatDto.setRegion(region);
            chatDto.setMessage(content);
            
            RegionalChatDto savedMessage = regionalChatService.sendMessage(
            	    userSession.getUsername(), chatDto);

            // 지역 내 모든 사용자에게 메시지 전송
            broadcastMessage(region, createNewMessageJson(savedMessage));

        } catch (Exception e) {
            log.error("메시지 저장 실패", e);
            sendErrorMessage(session, "메시지 전송에 실패했습니다.");
        }
    }

    private void handleDeleteMessage(WebSocketSession session, JsonNode jsonNode) throws Exception {
        UserSession userSession = userSessions.get(session.getId());
        if (userSession == null) {
            sendErrorMessage(session, "인증되지 않은 사용자입니다.");
            return;
        }

        Long messageId = jsonNode.get("messageId").asLong();
        
        try {
            regionalChatService.deleteMessage(userSession.getUserId().toString(), messageId);
            
            // 지역 내 모든 사용자에게 삭제 알림
            ObjectNode deleteMessage = objectMapper.createObjectNode();
            deleteMessage.put("type", "MESSAGE_DELETED");
            deleteMessage.put("messageId", messageId);
            
            broadcastMessage(userSession.getRegion(), deleteMessage);
            
        } catch (Exception e) {
            log.error("메시지 삭제 실패", e);
            sendErrorMessage(session, "메시지 삭제에 실패했습니다.");
        }
    }

    private void handleReportMessage(WebSocketSession session, JsonNode jsonNode) throws Exception {
        UserSession userSession = userSessions.get(session.getId());
        if (userSession == null) {
            sendErrorMessage(session, "인증되지 않은 사용자입니다.");
            return;
        }

        Long messageId = jsonNode.get("messageId").asLong();
        String reason = jsonNode.get("reason").asText();
        
        try {
            regionalChatService.reportMessage(
                messageId, 
                userSession.getUserId(), 
                userSession.getNickname(),
                reason
            );
            
            // 신고자에게만 확인 메시지 전송
            ObjectNode reportConfirm = objectMapper.createObjectNode();
            reportConfirm.put("type", "REPORT_CONFIRMED");
            reportConfirm.put("messageId", messageId);
            
            session.sendMessage(new TextMessage(reportConfirm.toString()));
            
        } catch (Exception e) {
            log.error("메시지 신고 실패", e);
            sendErrorMessage(session, "신고 처리에 실패했습니다.");
        }
    }

    private void sendRecentMessages(WebSocketSession session, String region) throws Exception {
        try {
            // 최근 50개 메시지 조회
            var messages = regionalChatService.getRegionalMessages(region, 
                org.springframework.data.domain.PageRequest.of(0, 50));
            
            ObjectNode messagesList = objectMapper.createObjectNode();
            messagesList.put("type", "REGION_MESSAGES");
            messagesList.putPOJO("messages", messages.getContent());
            
            session.sendMessage(new TextMessage(messagesList.toString()));
            
        } catch (Exception e) {
            log.error("최근 메시지 조회 실패", e);
        }
    }

    private void broadcastMessage(String region, JsonNode message) {
        CopyOnWriteArraySet<WebSocketSession> sessions = regionSessions.get(region);
        if (sessions != null) {
            String messageStr = message.toString();
            sessions.removeIf(session -> {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(messageStr));
                        return false;
                    }
                } catch (IOException e) {
                    log.error("메시지 전송 실패: " + session.getId(), e);
                }
                return true;
            });
        }
    }

    private void broadcastUserCount(String region) {
        CopyOnWriteArraySet<WebSocketSession> sessions = regionSessions.get(region);
        if (sessions != null) {
            ObjectNode userCount = objectMapper.createObjectNode();
            userCount.put("type", "USER_COUNT");
            userCount.put("region", region);
            userCount.put("count", sessions.size());
            
            broadcastMessage(region, userCount);
        }
    }

    private ObjectNode createNewMessageJson(RegionalChatDto message) {
        ObjectNode messageJson = objectMapper.createObjectNode();
        messageJson.put("type", "NEW_MESSAGE");
        messageJson.put("id", message.getId());
        messageJson.put("content", message.getMessage());
        messageJson.put("nickname", message.getUserNickname());
        messageJson.put("region", message.getRegion());
        messageJson.put("timestamp", message.getCreatedAt().toString());
        return messageJson;
    }

    private void sendErrorMessage(WebSocketSession session, String error) {
        try {
            ObjectNode errorMessage = objectMapper.createObjectNode();
            errorMessage.put("type", "ERROR");
            errorMessage.put("message", error);
            
            session.sendMessage(new TextMessage(errorMessage.toString()));
        } catch (IOException e) {
            log.error("오류 메시지 전송 실패", e);
        }
    }

    private boolean containsInappropriateContent(String content) {
        // 기본적인 욕설 필터링 로직
        String[] inappropriateWords = {
            "욕설1", "욕설2", "스팸", "광고"
            // 실제 구현시에는 더 정교한 필터링 필요
        };
        
        String lowerContent = content.toLowerCase();
        for (String word : inappropriateWords) {
            if (lowerContent.contains(word.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    // 지역별 실시간 통계 제공 (관리자용)
    public Map<String, Integer> getRegionUserCounts() {
        Map<String, Integer> counts = new ConcurrentHashMap<>();
        regionSessions.forEach((region, sessions) -> {
            counts.put(region, sessions.size());
        });
        return counts;
    }

    // 사용자 세션 정보 클래스
    private static class UserSession {
        private final Long userId;
        private final String username; // 추가
        private final String nickname;
        private final String region;

        public UserSession(Long userId, String username, String nickname, String region) {
            this.userId = userId;
            this.username = username;
            this.nickname = nickname;
            this.region = region;
        }

        public Long getUserId() { return userId; }
        public String getUsername() { return username; }
        public String getNickname() { return nickname; }
        public String getRegion() { return region; }
    }
}