package com.ayush.car_rental_system.car.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CarImageResponse {
    private Long id;
    private String imageUrl;
    private String publicId;
    private boolean isPrimary;
}
