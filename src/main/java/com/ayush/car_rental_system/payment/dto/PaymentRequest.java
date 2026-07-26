package com.ayush.car_rental_system.payment.dto;

import com.ayush.car_rental_system.payment.entity.Payment;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequest {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "Payment method is required")
    private Payment.PaymentMethod method;
}
