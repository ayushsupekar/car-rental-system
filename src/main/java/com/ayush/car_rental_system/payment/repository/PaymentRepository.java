package com.ayush.car_rental_system.payment.repository;

import com.ayush.car_rental_system.payment.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);

    Page<Payment> findAllByBookingUserId(Long userId, Pageable pageable);

    Optional<Payment> findByTransactionId(String transactionId);
}
