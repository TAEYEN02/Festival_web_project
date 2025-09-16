package com.korea.festival.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FestivalResponseDTO {
    private String contentid;       // contentId -> contentid
    private String title;           // name -> title
    private String addr1;           // location -> addr1
    private String firstimage;      // 그대로 사용
    private String eventstartdate;  // startDate -> "yyyyMMdd"
    private String eventenddate;    // endDate -> "yyyyMMdd"
    private int likes;              // likesCount -> likes
}