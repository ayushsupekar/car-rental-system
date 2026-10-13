package com.ayush.car_rental_system.notification.service;

import com.ayush.car_rental_system.booking.entity.Booking;
import com.ayush.car_rental_system.payment.entity.Payment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    @Async
    public void sendBookingConfirmation(Booking booking) {
        log.info("[EMAIL] Booking confirmed #{} for {} — {} {}",
                booking.getId(), booking.getUser().getEmail(),
                booking.getCar().getBrand().getName(), booking.getCar().getModel());
    }

    @Async
    public void sendBookingCancellation(Booking booking) {
        log.info("[EMAIL] Booking cancelled #{} for {}",
                booking.getId(), booking.getUser().getEmail());
    }

    @Async
    public void sendPaymentSuccess(Payment payment) {
        log.info("[EMAIL] Payment success TXN={} amount={} for {}",
                payment.getTransactionId(), payment.getAmount(),
                payment.getBooking().getUser().getEmail());
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String firstName) {
        log.info("[EMAIL] Welcome email for {} <{}>", firstName, toEmail);
    }
}
