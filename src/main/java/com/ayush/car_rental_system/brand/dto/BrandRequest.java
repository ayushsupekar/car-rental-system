package com.ayush.car_rental_system.brand.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BrandRequest {

    @NotBlank(message = "Brand name is required")
    @Size(max = 50, message = "Brand name must not exceed 50 characters")
    private String name;

    private String logoUrl;
}
