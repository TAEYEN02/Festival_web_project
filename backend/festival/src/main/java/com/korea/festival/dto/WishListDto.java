package com.korea.festival.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WishListDto {
    private Long id;
    private String itemType;
    private Long itemId;
    private String itemTitle;
    private String itemImage;
    private Integer itemPrice;
    private LocalDateTime createdAt;
}