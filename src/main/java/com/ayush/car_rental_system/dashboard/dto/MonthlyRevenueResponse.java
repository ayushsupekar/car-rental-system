package com.ayush.car_rental_system.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class MonthlyRevenueResponse {
    private String month;       // e.g. "2025-01"
    private BigDecimal revenue;
}
