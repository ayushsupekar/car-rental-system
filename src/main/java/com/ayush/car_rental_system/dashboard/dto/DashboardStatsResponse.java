package com.ayush.car_rental_system.dashboard.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class DashboardStatsResponse {

    // ===== USER STATS =====
    private long totalUsers;
    private long activeUsers;
    private long newUsersThisMonth;

    // ===== CAR STATS =====
    private long totalCars;
    private long availableCars;
    private long unavailableCars;

    // ===== BOOKING STATS =====
    private long totalBookings;
    private long pendingBookings;
    private long confirmedBookings;
    private long activeBookings;
    private long completedBookings;
    private long cancelledBookings;

    // ===== REVENUE STATS =====
    private BigDecimal totalRevenue;          // from SUCCESS payments
    private BigDecimal revenueThisMonth;
    private BigDecimal revenueLastMonth;

    // ===== TRENDS =====
    private List<MonthlyRevenueResponse> monthlyRevenue;    // last 6 months
    private List<MonthlyBookingResponse> monthlyBookings;   // last 6 months
    private List<TopCarResponse> topCars;                   // top 5 by bookings
}
