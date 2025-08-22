package com.korea.festival.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.korea.festival.dto.InquiryDto;
import com.korea.festival.entity.Inquiry;
import com.korea.festival.entity.User;
import com.korea.festival.repository.InquiryRepository;
import com.korea.festival.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class InquiryService {
    
    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;
    
    public InquiryDto createInquiry(String username, InquiryDto inquiryDTO) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        Inquiry inquiry = new Inquiry();
        inquiry.setUser(user);
        inquiry.setTitle(inquiryDTO.getTitle());
        inquiry.setContent(inquiryDTO.getContent());
        
        Inquiry savedInquiry = inquiryRepository.save(inquiry);
        
        return convertToDTO(savedInquiry);
    }
    
    @Transactional(readOnly = true)
    public Page<InquiryDto> getUserInquiries(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        return inquiryRepository.findByUserOrderByCreatedAtDesc(user, pageable)
            .map(this::convertToDTO);
    }
    
    @Transactional(readOnly = true)
    public InquiryDto getInquiry(String username, Long inquiryId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다"));
        
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
            .orElseThrow(() -> new RuntimeException("문의를 찾을 수 없습니다"));
        
        if (!inquiry.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("접근 권한이 없습니다");
        }
        
        return convertToDTO(inquiry);
    }
    
    private InquiryDto convertToDTO(Inquiry inquiry) {
        return new InquiryDto(
            inquiry.getId(),
            inquiry.getTitle(),
            inquiry.getContent(),
            inquiry.getStatus().toString(),
            inquiry.getAnswer(),
            inquiry.getCreatedAt(),
            inquiry.getAnsweredAt()
        );
    }
}