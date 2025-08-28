package com.korea.festival.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FestivalLikeDTO {
    private boolean liked;   // 내가 좋아요 눌렀는지
    private int likeCount;   // 해당 축제 총 좋아요 수
}
