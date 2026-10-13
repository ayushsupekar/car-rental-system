package com.ayush.car_rental_system.user.service;

import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.ayush.car_rental_system.common.config.CloudinaryService;
import com.ayush.car_rental_system.common.exception.ResourceNotFoundException;
import com.ayush.car_rental_system.user.dto.ChangePasswordRequest;
import com.ayush.car_rental_system.user.dto.UpdateProfileRequest;
import com.ayush.car_rental_system.user.dto.UserResponse;
import com.ayush.car_rental_system.user.entity.User;
import com.ayush.car_rental_system.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        User user = findByEmailOrThrow(email);
        return toResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findByEmailOrThrow(email);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = findByEmailOrThrow(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public UserResponse updateProfileImage(String email, MultipartFile file) {
        String contentType = file == null ? null : file.getContentType();
        if (file == null || file.isEmpty() || contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Please select a valid image file");
        }

        User user = findByEmailOrThrow(email);
        var upload = cloudinaryService.upload(file, "car-rental/profiles");
        user.setProfileImageUrl(upload.get("url"));
        return toResponse(userRepository.save(user));
    }

    // ===== ADMIN OPERATIONS =====

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return toResponse(findByIdOrThrow(id));
    }

    @Transactional
    public UserResponse toggleUserStatus(Long id) {
        User user = findByIdOrThrow(id);
        user.setActive(!user.isActive());
        return toResponse(userRepository.save(user));
    }

    // ===== PRIVATE HELPERS =====

    private User findByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private User findByIdOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImageUrl(user.getProfileImageUrl())
                .isActive(user.isActive())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .build();
    }
}
