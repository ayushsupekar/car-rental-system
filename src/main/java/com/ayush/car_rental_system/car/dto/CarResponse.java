package com.ayush.car_rental_system.car.dto;

import com.ayush.car_rental_system.car.entity.Car;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class CarResponse {
    private Long id;
    private String model;
    private Integer year;
    private BigDecimal pricePerDay;
    private Integer seats;
    private Car.TransmissionType transmission;
    private Car.FuelType fuelType;
    private String description;
    private boolean isAvailable;
    private boolean isActive;

    // Nested brand info — frontend doesn't need to make a second request
    private Long brandId;
    private String brandName;
    private String brandLogoUrl;

    // Nested category info
    private Long categoryId;
    private String categoryName;

    // Primary image URL for listing cards
    private String primaryImageUrl;

    // All images for detail page
    private List<CarImageResponse> images;

    // Rating summary — populated from reviews
    private Double averageRating;
    private Long totalReviews;

    private LocalDateTime createdAt;
}
