package com.korea.festival.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignUpRequest {
 @NotBlank(message = "사용자명은 필수입니다")
 @Size(min = 4, max = 20, message = "사용자명은 4-20자 사이여야 합니다")
 private String username;
 
 @NotBlank(message = "닉네임은 필수입니다")
 @Size(min = 2, max = 20, message = "닉네임은 2-20자 사이여야 합니다")
 private String nickname;
 
 @NotBlank(message = "비밀번호는 필수입니다")
 @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다")
 private String password;
 
 @Email(message = "올바른 이메일 형식이 아닙니다")
 @NotBlank(message = "이메일은 필수입니다")
 private String email;
}
