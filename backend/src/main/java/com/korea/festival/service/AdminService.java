package com.korea.festival.service;

import com.korea.festival.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    public Page<UserDto> getUsers(int page, int size, String sortBy, String sortDir, String search) {
        return Page.empty();
    }

    public UserDetailDto getUserDetail(Long userId) {
        return new UserDetailDto(null);
    }

    public void toggleUserStatus(Long userId) {
    }

    public Page<InquiryDto> getInquiries(int page, int size, String status) {

        return Page.empty();
    }

    public void respondToInquiry(Long inquiryId, InquiryResponseDto responseDto, String name) {
    }

    public AdminDashboardDto getDashboardStats() {
        return new AdminDashboardDto();
    }
}