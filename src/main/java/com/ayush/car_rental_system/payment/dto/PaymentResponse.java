package com.ayush.car_rental_system.payment.dto;

import com.ayush.car_rental_system.payment.entity.Payment;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentResponse {
    private Long id;
    private BigDecimal amount;
    private Payment.PaymentStatus status;
    private Payment.PaymentMethod method;
    private String transactionId;
    private LocalDateTime paidAt;

    // Booking summary
    private Long bookingId;
    private String carModel;
    private String brandName;
    private Integer totalDays;

    private LocalDateTime createdAt;
}
