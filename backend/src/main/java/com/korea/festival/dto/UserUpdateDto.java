package com.korea.festival.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserUpdateDto {
    private String nickname;
    private String phoneNumber;
    private LocalDate birthDate;
    private String gender;
}
