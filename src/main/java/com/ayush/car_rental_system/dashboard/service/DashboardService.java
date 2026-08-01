package com.ayush.car_rental_system.dashboard.service;

import com.ayush.car_rental_system.booking.entity.Booking;
import com.ayush.car_rental_system.booking.repository.BookingRepository;
import com.ayush.car_rental_system.car.repository.CarRepository;
import com.ayush.car_rental_system.dashboard.dto.*;
import com.ayush.car_rental_system.payment.repository.PaymentRepository;
import com.ayush.car_rental_system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        LocalDateTime sixMonthsAgo = startOfMonth.minusMonths(5);

        return DashboardStatsResponse.builder()
                // Users
                .totalUsers(userRepository.count())
                .activeUsers(userRepository.countByIsActiveTrue())
                .newUsersThisMonth(userRepository.countNewUsersInPeriod(startOfMonth, now))
                // Cars
                .totalCars(carRepository.count())
                .availableCars(carRepository.countByIsAvailableTrueAndIsActiveTrue())
                .unavailableCars(carRepository.countByIsAvailableFalseAndIsActiveTrue())
                // Bookings
                .totalBookings(bookingRepository.count())
                .pendingBookings(bookingRepository.countByStatus(Booking.BookingStatus.PENDING))
                .confirmedBookings(bookingRepository.countByStatus(Booking.BookingStatus.CONFIRMED))
                .activeBookings(bookingRepository.countByStatus(Booking.BookingStatus.ACTIVE))
                .completedBookings(bookingRepository.countByStatus(Booking.BookingStatus.COMPLETED))
                .cancelledBookings(bookingRepository.countByStatus(Booking.BookingStatus.CANCELLED))
                // Revenue
                .totalRevenue(paymentRepository.findTotalRevenue())
                .revenueThisMonth(paymentRepository.findRevenueInPeriod(startOfMonth, now))
                .revenueLastMonth(paymentRepository.findRevenueInPeriod(startOfLastMonth, startOfMonth))
                // Trends
                .monthlyRevenue(buildMonthlyRevenue(sixMonthsAgo))
                .monthlyBookings(buildMonthlyBookings(sixMonthsAgo))
                .topCars(buildTopCars())
                .build();
    }

    private List<MonthlyRevenueResponse> buildMonthlyRevenue(LocalDateTime since) {
        return paymentRepository.findMonthlyRevenue(since).stream()
                .map(row -> new MonthlyRevenueResponse(
                        (String) row[0],
                        row[1] != null ? (BigDecimal) row[1] : BigDecimal.ZERO))
                .toList();
    }

    private List<MonthlyBookingResponse> buildMonthlyBookings(LocalDateTime since) {
        return bookingRepository.findMonthlyBookingStats(since).stream()
                .map(row -> new MonthlyBookingResponse(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        row[2] != null ? ((Number) row[2]).longValue() : 0L))
                .toList();
    }

    private List<TopCarResponse> buildTopCars() {
        return bookingRepository.findTopCarsByBookings(PageRequest.of(0, 5)).stream()
                .map(row -> new TopCarResponse(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        (String) row[2],
                        ((Number) row[3]).longValue(),
                        row[4] != null ? (BigDecimal) row[4] : BigDecimal.ZERO))
                .toList();
    }
}
