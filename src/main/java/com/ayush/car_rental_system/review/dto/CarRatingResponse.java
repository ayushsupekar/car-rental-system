package com.ayush.car_rental_system.review.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CarRatingResponse {
    private Long carId;
    private String carModel;
    private Double averageRating;
    private Long totalReviews;
}
