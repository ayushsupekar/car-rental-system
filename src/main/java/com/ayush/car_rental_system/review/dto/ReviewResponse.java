package com.ayush.car_rental_system.review.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;

    // Reviewer info
    private Long userId;
    private String reviewerName;

    // Car info
    private Long carId;
    private String carModel;
    private String brandName;

    private Long bookingId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
