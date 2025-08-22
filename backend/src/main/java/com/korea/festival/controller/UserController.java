package com.korea.festival.controller;

import com.korea.festival.dto.UserDetailDto;
import com.korea.festival.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    // 현재 로그인한 사용자 정보 조회
    @GetMapping("/me")
    public UserDetailDto getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return userService.getUserDetailByUsername(userDetails.getUsername());
    }

    // 사용자 정보 수정
    @PutMapping("/me")
    public UserDetailDto updateCurrentUser(@AuthenticationPrincipal UserDetails userDetails,
                                           @RequestBody UserDetailDto updateDto) {
        return userService.updateUser(userDetails.getUsername(), updateDto);
    }
}
