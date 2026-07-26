package com.ayush.car_rental_system.booking.dto;

import com.ayush.car_rental_system.booking.entity.Booking;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class BookingResponse {
    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private int totalDays;
    private BigDecimal totalPrice;
    private Booking.BookingStatus status;
    private String cancellationReason;

    // User summary
    private Long userId;
    private String userFullName;
    private String userEmail;

    // Car summary
    private Long carId;
    private String carModel;
    private Integer carYear;
    private String brandName;
    private String primaryImageUrl;

    private LocalDateTime createdAt;
}
