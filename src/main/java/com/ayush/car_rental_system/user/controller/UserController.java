package com.ayush.car_rental_system.user.controller;

import com.ayush.car_rental_system.common.response.ApiResponse;
import com.ayush.car_rental_system.user.dto.ChangePasswordRequest;
import com.ayush.car_rental_system.user.dto.UpdateProfileRequest;
import com.ayush.car_rental_system.user.dto.UserResponse;
import com.ayush.car_rental_system.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Manage your own profile")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Profile fetched",
                userService.getProfile(userDetails.getUsername())));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated",
                userService.updateProfile(userDetails.getUsername(), request)));
    }

    @PatchMapping("/me/password")
    @Operation(summary = "Change password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    @PostMapping(value = "/me/profile-image", consumes = "multipart/form-data")
    @Operation(summary = "Upload profile image")
    public ResponseEntity<ApiResponse<UserResponse>> uploadProfileImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Profile image updated",
                userService.updateProfileImage(userDetails.getUsername(), file)));
    }
}
