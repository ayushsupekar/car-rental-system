package com.ayush.car_rental_system.notification.service;

import com.ayush.car_rental_system.booking.entity.Booking;
import com.ayush.car_rental_system.payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Async
    public void sendBookingConfirmation(Booking booking) {
        String subject = "Booking Confirmed — " + booking.getCar().getModel();
        String body = String.format("""
                Hi %s,

                Your booking has been confirmed!

                Booking ID  : #%d
                Car         : %s %s (%d)
                Start Date  : %s
                End Date    : %s
                Total Price : ₹%.2f

                Thank you for choosing Car Rental!
                """,
                booking.getUser().getFirstName(),
                booking.getId(),
                booking.getCar().getBrand().getName(),
                booking.getCar().getModel(),
                booking.getCar().getYear(),
                booking.getStartDate(),
                booking.getEndDate(),
                booking.getTotalPrice());

        send(booking.getUser().getEmail(), subject, body);
    }

    @Async
    public void sendBookingCancellation(Booking booking) {
        String subject = "Booking Cancelled — #" + booking.getId();
        String body = String.format("""
                Hi %s,

                Your booking #%d for %s %s has been cancelled.

                Reason: %s

                If you paid, a refund will be processed within 5-7 business days.

                Car Rental Team
                """,
                booking.getUser().getFirstName(),
                booking.getId(),
                booking.getCar().getBrand().getName(),
                booking.getCar().getModel(),
                booking.getCancellationReason());

        send(booking.getUser().getEmail(), subject, body);
    }

    @Async
    public void sendPaymentSuccess(Payment payment) {
        Booking booking = payment.getBooking();
        String subject = "Payment Successful — ₹" + payment.getAmount();
        String body = String.format("""
                Hi %s,

                Payment received successfully!

                Transaction ID : %s
                Amount         : ₹%.2f
                Car            : %s %s
                Booking ID     : #%d

                Car Rental Team
                """,
                booking.getUser().getFirstName(),
                payment.getTransactionId(),
                payment.getAmount(),
                booking.getCar().getBrand().getName(),
                booking.getCar().getModel(),
                booking.getId());

        send(booking.getUser().getEmail(), subject, body);
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String firstName) {
        String subject = "Welcome to Car Rental!";
        String body = String.format("""
                Hi %s,

                Welcome to Car Rental! Your account has been created successfully.

                Browse our fleet and book your perfect car today.

                Car Rental Team
                """, firstName);

        send(toEmail, subject, body);
    }

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            // Never let email failure break the main transaction
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
