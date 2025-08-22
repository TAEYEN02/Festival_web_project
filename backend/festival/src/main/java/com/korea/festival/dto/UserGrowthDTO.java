package com.korea.festival.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserGrowthDTO {
    private LocalDate date;
    private Long newUsers;
    private Long totalUsers;
}