package com.ayush.car_rental_system.car.dto;

import com.ayush.car_rental_system.car.entity.Car;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CarFilterRequest {
    private String keyword;           // searches model name
    private Long brandId;
    private Long categoryId;
    private Car.TransmissionType transmission;
    private Car.FuelType fuelType;
    private Integer seats;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Boolean isAvailable;      // null = all, true = available only
}
