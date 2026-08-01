package com.ayush.car_rental_system.brand.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BrandResponse {
    private Long id;
    private String name;
    private String logoUrl;
    private boolean isActive;
    private LocalDateTime createdAt;
}
