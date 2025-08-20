package com.example.festival.mapper;

import com.example.festival.dto.*;
import com.example.festival.entity.*;

import java.util.stream.Collectors;

public class FestivalMapper {

    // FestivalEntity → FestivalDTO
    public static FestivalDTO toDto(FestivalEntity festival) {
        return FestivalDTO.builder()
                .id(festival.getId())
                .externalId(festival.getExternalId())
                .title(festival.getTitle())
                .startDate(festival.getStartDate())
                .endDate(festival.getEndDate())
                .location(festival.getLocation())
                .imageUrl(festival.getImageUrl())
                .description(festival.getDescription())
                .bookingUrl(festival.getBookingUrl())
                .views(festival.getViews())
                .clicks(festival.getClicks())
                .createdAt(festival.getCreatedAt())
                .images(
                        festival.getImages() != null
                                ? festival.getImages().stream()
                                .map(FestivalMapper::toDto)
                                .collect(Collectors.toList())
                                : null
                )
                .posts(
                        festival.getPosts() != null
                                ? festival.getPosts().stream()
                                .map(FestivalMapper::toDto)
                                .collect(Collectors.toList())
                                : null
                )
                .build();
    }
    
    
    // DTO → Entity
    public static FestivalEntity toEntity(FestivalDTO dto) {
        return FestivalEntity.builder()
                .externalId(dto.getExternalId())
                .title(dto.getTitle())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .location(dto.getLocation())
                .imageUrl(dto.getImageUrl())
                .description(dto.getDescription())
                .bookingUrl(dto.getBookingUrl())
                .active(true)
                .build();
    }

    
    // UserEntity → UserDTO
    public static UserDTO toDto(UserEntity user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }

    
    // CommunityPostEntity → CommunityPostDTO
    public static CommunityPostDTO toDto(CommunityPostEntity post) {
        return CommunityPostDTO.builder()
                .id(post.getId())
                .festivalId(post.getFestival().getId())
                .userId(post.getUser().getId())
                .userNickname(post.getUser().getNickname())
                .content(post.getContent())
                .createdAt(post.getCreatedAt())
                .build();
    }

    
    // FestivalImageEntity → FestivalImageDTO
    public static FestivalImageDTO toDto(FestivalImageEntity image) {
        return FestivalImageDTO.builder()
                .id(image.getId())
                .festivalId(image.getFestival().getId())
                .imageUrl(image.getImageUrl())
                .build();
    }
}
