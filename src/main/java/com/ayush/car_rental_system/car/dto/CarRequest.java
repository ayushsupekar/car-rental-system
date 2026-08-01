package com.ayush.car_rental_system.car.dto;

import com.ayush.car_rental_system.car.entity.Car;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CarRequest {

    @NotBlank(message = "Model is required")
    @Size(max = 100, message = "Model must not exceed 100 characters")
    private String model;

    @NotNull(message = "Year is required")
    @Min(value = 2000, message = "Year must be 2000 or later")
    @Max(value = 2100, message = "Invalid year")
    private Integer year;

    @NotNull(message = "Price per day is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal pricePerDay;

    @NotNull(message = "Seats is required")
    @Min(value = 1, message = "Seats must be at least 1")
    @Max(value = 20, message = "Seats must not exceed 20")
    private Integer seats;

    @NotNull(message = "Transmission type is required")
    private Car.TransmissionType transmission;

    @NotNull(message = "Fuel type is required")
    private Car.FuelType fuelType;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Brand ID is required")
    private Long brandId;

    @NotNull(message = "Category ID is required")
    private Long categoryId;
}
