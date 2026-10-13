package com.ayush.car_rental_system.booking.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ayush.car_rental_system.booking.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findAllByUserId(Long userId, Pageable pageable);

    Optional<Booking> findByIdAndUserId(Long id, Long userId);

    @Query("""
            SELECT COUNT(b) > 0 FROM Booking b
            WHERE b.car.id = :carId
            AND b.status NOT IN (com.ayush.car_rental_system.booking.entity.Booking.BookingStatus.CANCELLED)
            AND b.startDate < :endDate
            AND b.endDate > :startDate
            """)
    boolean existsOverlappingBooking(Long carId, LocalDate startDate, LocalDate endDate);

    List<Booking> findAllByStatus(Booking.BookingStatus status);

    long countByStatus(Booking.BookingStatus status);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.status = com.ayush.car_rental_system.booking.entity.Booking.BookingStatus.CONFIRMED
            AND b.startDate <= :today
            """)
    List<Booking> findConfirmedBookingsStartingOn(LocalDate today);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.status = com.ayush.car_rental_system.booking.entity.Booking.BookingStatus.ACTIVE
            AND b.endDate < :today
            """)
    List<Booking> findActiveBookingsEndedBefore(LocalDate today);

    // ===== DASHBOARD =====

    // Monthly booking counts — returns [yearMonth, total, cancelled]
    @Query("""
            SELECT CONCAT(YEAR(b.createdAt), '-', LPAD(CAST(MONTH(b.createdAt) AS string), 2, '0')),
                   COUNT(b),
                   SUM(CASE WHEN b.status = 'CANCELLED' THEN 1L ELSE 0L END)
            FROM Booking b
            WHERE b.createdAt >= :since
            GROUP BY CONCAT(YEAR(b.createdAt), '-', LPAD(CAST(MONTH(b.createdAt) AS string), 2, '0'))
            ORDER BY CONCAT(YEAR(b.createdAt), '-', LPAD(CAST(MONTH(b.createdAt) AS string), 2, '0'))
            """)
    List<Object[]> findMonthlyBookingStats(@Param("since") LocalDateTime since);

    // Top N cars by booking count — returns [carId, model, brandName, count, revenue]
    @Query("""
            SELECT b.car.id, b.car.model, b.car.brand.name,
                   COUNT(b), SUM(b.totalPrice)
            FROM Booking b
            WHERE b.status != com.ayush.car_rental_system.booking.entity.Booking.BookingStatus.CANCELLED
            GROUP BY b.car.id, b.car.model, b.car.brand.name
            ORDER BY COUNT(b) DESC
            """)
    List<Object[]> findTopCarsByBookings(Pageable pageable);
}
