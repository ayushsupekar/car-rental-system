package com.ayush.car_rental_system.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class TopCarResponse {
    private Long carId;
    private String model;
    private String brandName;
    private long totalBookings;
    private BigDecimal totalRevenue;
}
