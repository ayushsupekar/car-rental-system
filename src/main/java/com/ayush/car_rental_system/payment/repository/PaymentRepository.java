package com.ayush.car_rental_system.payment.repository;

import com.ayush.car_rental_system.payment.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);

    Page<Payment> findAllByBookingUserId(Long userId, Pageable pageable);

    Optional<Payment> findByTransactionId(String transactionId);

    // ===== DASHBOARD =====

    // Total revenue from all successful payments
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'SUCCESS'")
    BigDecimal findTotalRevenue();

    // Revenue within a date range
    @Query("""
            SELECT COALESCE(SUM(p.amount), 0) FROM Payment p
            WHERE p.status = 'SUCCESS'
            AND p.paidAt >= :start AND p.paidAt < :end
            """)
    BigDecimal findRevenueInPeriod(@Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end);

    // Monthly revenue — returns [yearMonth, revenue]
    @Query("""
            SELECT CONCAT(YEAR(p.paidAt), '-', LPAD(CAST(MONTH(p.paidAt) AS string), 2, '0')),
                   SUM(p.amount)
            FROM Payment p
            WHERE p.status = 'SUCCESS'
            AND p.paidAt >= :since
            GROUP BY YEAR(p.paidAt), MONTH(p.paidAt)
            ORDER BY YEAR(p.paidAt), MONTH(p.paidAt)
            """)
    List<Object[]> findMonthlyRevenue(@Param("since") LocalDateTime since);
}
