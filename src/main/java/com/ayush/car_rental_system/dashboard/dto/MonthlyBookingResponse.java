package com.ayush.car_rental_system.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MonthlyBookingResponse {
    private String month;       // e.g. "2025-01"
    private long totalBookings;
    private long cancelledBookings;
}
