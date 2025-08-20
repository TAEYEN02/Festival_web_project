package com.example.festival.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class UserDTO {
	
	private Long id;
    private String email;
    private String nickname;
    private String role;
    private LocalDateTime createdAt;

}
