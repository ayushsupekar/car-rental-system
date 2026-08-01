package com.ayush.car_rental_system.payment.service;

import com.ayush.car_rental_system.booking.entity.Booking;
import com.ayush.car_rental_system.booking.repository.BookingRepository;
import com.ayush.car_rental_system.common.exception.DuplicateResourceException;
import com.ayush.car_rental_system.common.exception.ResourceNotFoundException;
import com.ayush.car_rental_system.notification.service.EmailService;
import com.ayush.car_rental_system.payment.dto.PaymentRequest;
import com.ayush.car_rental_system.payment.dto.PaymentResponse;
import com.ayush.car_rental_system.payment.entity.Payment;
import com.ayush.car_rental_system.payment.repository.PaymentRepository;
import com.ayush.car_rental_system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public PaymentResponse initiatePayment(String userEmail, PaymentRequest request) {
        Booking booking = findBookingOrThrow(request.getBookingId());

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new IllegalStateException("You are not authorized to pay for this booking");
        }
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new IllegalStateException(
                    "Payment can only be initiated for PENDING bookings. Current: "
                            + booking.getStatus());
        }
        if (paymentRepository.existsByBookingId(booking.getId())) {
            throw new DuplicateResourceException(
                    "A payment already exists for booking: " + booking.getId());
        }

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalPrice())
                .method(request.getMethod())
                .status(Payment.PaymentStatus.PENDING)
                .build();

        Payment saved = paymentRepository.save(payment);
        log.info("Payment initiated for booking {} by user {}", booking.getId(), userEmail);
        return toResponse(saved);
    }

    @Transactional
    public PaymentResponse confirmPayment(Long paymentId, String transactionId) {
        Payment payment = findPaymentOrThrow(paymentId);

        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new IllegalStateException(
                    "Only PENDING payments can be confirmed. Current: " + payment.getStatus());
        }

        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment.setTransactionId(transactionId != null ? transactionId
                : "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setPaidAt(LocalDateTime.now());

        Booking booking = payment.getBooking();
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        Payment saved = paymentRepository.save(payment);
        emailService.sendPaymentSuccess(saved);
        log.info("Payment {} confirmed for booking {}", saved.getId(), booking.getId());
        return toResponse(saved);
    }

    @Transactional
    public PaymentResponse failPayment(Long paymentId) {
        Payment payment = findPaymentOrThrow(paymentId);

        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new IllegalStateException("Only PENDING payments can be marked as failed");
        }

        payment.setStatus(Payment.PaymentStatus.FAILED);
        log.warn("Payment {} failed for booking {}", payment.getId(),
                payment.getBooking().getId());
        return toResponse(paymentRepository.save(payment));
    }

    @Transactional
    public PaymentResponse refundPayment(Long paymentId) {
        Payment payment = findPaymentOrThrow(paymentId);

        if (payment.getStatus() != Payment.PaymentStatus.SUCCESS) {
            throw new IllegalStateException("Only successful payments can be refunded");
        }

        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        log.info("Payment {} refunded for booking {}", payment.getId(),
                payment.getBooking().getId());
        return toResponse(paymentRepository.save(payment));
    }

    // ===== READ =====

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(String userEmail, Long bookingId) {
        Booking booking = findBookingOrThrow(bookingId);
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new IllegalStateException("You are not authorized to view this payment");
        }
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No payment found for booking: " + bookingId));
        return toResponse(payment);
    }

    @Transactional(readOnly = true)
    public Page<PaymentResponse> getMyPayments(String userEmail, Pageable pageable) {
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return paymentRepository.findAllByBookingUserId(user.getId(), pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<PaymentResponse> getAllPayments(Pageable pageable) {
        return paymentRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        return toResponse(findPaymentOrThrow(id));
    }

    // ===== HELPERS =====

    private Payment findPaymentOrThrow(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found with id: " + id));
    }

    private Booking findBookingOrThrow(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with id: " + bookingId));
    }

    private PaymentResponse toResponse(Payment payment) {
        Booking booking = payment.getBooking();
        int totalDays = (int) ChronoUnit.DAYS.between(
                booking.getStartDate(), booking.getEndDate());

        return PaymentResponse.builder()
                .id(payment.getId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .method(payment.getMethod())
                .transactionId(payment.getTransactionId())
                .paidAt(payment.getPaidAt())
                .bookingId(booking.getId())
                .carModel(booking.getCar().getModel())
                .brandName(booking.getCar().getBrand().getName())
                .totalDays(totalDays)
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
