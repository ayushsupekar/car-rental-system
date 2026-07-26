package com.ayush.car_rental_system.review.controller;

import com.ayush.car_rental_system.common.response.ApiResponse;
import com.ayush.car_rental_system.review.dto.*;
import com.ayush.car_rental_system.review.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Car reviews and ratings")
public class ReviewController {

    private final ReviewService reviewService;

    // ===== PUBLIC ENDPOINTS =====

    @GetMapping("/cars/{carId}")
    @Operation(summary = "Get all reviews for a car")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getCarReviews(
            @PathVariable Long carId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return ResponseEntity.ok(ApiResponse.success("Reviews fetched",
                reviewService.getReviewsByCarId(carId, PageRequest.of(page, size, sort))));
    }

    @GetMapping("/cars/{carId}/rating")
    @Operation(summary = "Get average rating for a car")
    public ResponseEntity<ApiResponse<CarRatingResponse>> getCarRating(
            @PathVariable Long carId) {
        return ResponseEntity.ok(ApiResponse.success("Rating fetched",
                reviewService.getCarRating(carId)));
    }

    // ===== AUTHENTICATED ENDPOINTS =====

    @PostMapping
    @Operation(summary = "Submit a review for a completed booking")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewRequest request) {

        ReviewResponse response = reviewService.createReview(
                userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update your review")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateReviewRequest request) {

        return ResponseEntity.ok(ApiResponse.success("Review updated",
                reviewService.updateReview(userDetails.getUsername(), id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete your review")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> deleteMyReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        reviewService.deleteMyReview(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted"));
    }

    @GetMapping("/my")
    @Operation(summary = "Get all my reviews")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getMyReviews(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(ApiResponse.success("Reviews fetched",
                reviewService.getMyReviews(
                        userDetails.getUsername(), PageRequest.of(page, size,
                                Sort.by("createdAt").descending()))));
    }
}
