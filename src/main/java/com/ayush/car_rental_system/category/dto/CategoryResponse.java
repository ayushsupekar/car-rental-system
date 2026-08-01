package com.ayush.car_rental_system.category.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private boolean isActive;
    private LocalDateTime createdAt;
}
