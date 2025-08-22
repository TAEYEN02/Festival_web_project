package com.korea.festival.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.korea.festival.dto.RegionalChatDto;
import com.korea.festival.entity.RegionalChat;
import com.korea.festival.entity.User;
import com.korea.festival.repository.RegionalChatRepository;
import com.korea.festival.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RegionalChatService {
    
    private final RegionalChatRepository regionalChatRepository;
    private final UserRepository userRepository;
    
    public RegionalChatDto sendMessage(String username, RegionalChatDto chatDTO) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        RegionalChat chat = new RegionalChat();
        chat.setUser(user);
        chat.setRegion(chatDTO.getRegion());
        chat.setMessage(chatDTO.getMessage());
        
        RegionalChat saved = regionalChatRepository.save(chat);
        return convertToDTO(saved);
    }
    
    @Transactional(readOnly = true)
    public Page<RegionalChatDto> getRegionalMessages(String region, Pageable pageable) {
        return regionalChatRepository.findByRegionAndIsActiveTrueOrderByCreatedAtDesc(region, pageable)
            .map(this::convertToDTO);
    }
    
    @Transactional(readOnly = true)
    public Page<RegionalChatDto> getUserMessages(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        return regionalChatRepository.findByUserOrderByCreatedAtDesc(user, pageable)
            .map(this::convertToDTO);
    }
    
    public void deleteMessage(String username, Long messageId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        RegionalChat chat = regionalChatRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("메시지를 찾을 수 없습니다"));
        
        if (!chat.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("삭제 권한이 없습니다");
        }
        
        chat.setIsActive(false);
        regionalChatRepository.save(chat);
    }
    
    private RegionalChatDto convertToDTO(RegionalChat chat) {
        return new RegionalChatDto(
            chat.getId(),
            chat.getRegion(),
            chat.getMessage(),
            chat.getUser().getNickname(),
            chat.getCreatedAt()
        );
    }
}