package com.ayush.car_rental_system.booking.repository;

import com.ayush.car_rental_system.booking.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findAllByUserId(Long userId, Pageable pageable);

    Optional<Booking> findByIdAndUserId(Long id, Long userId);

    // Checks if a car has any ACTIVE booking overlapping the requested date range.
    // Overlap condition: existing.startDate < requested.endDate
    //                AND existing.endDate   > requested.startDate
    // Excludes CANCELLED bookings — they free up the car.
    @Query("""
            SELECT COUNT(b) > 0 FROM Booking b
            WHERE b.car.id = :carId
            AND b.status NOT IN (com.ayush.car_rental_system.booking.entity.Booking.BookingStatus.CANCELLED)
            AND b.startDate < :endDate
            AND b.endDate > :startDate
            """)
    boolean existsOverlappingBooking(Long carId, LocalDate startDate, LocalDate endDate);

    // For admin dashboard stats
    List<Booking> findAllByStatus(Booking.BookingStatus status);

    // Bookings that are CONFIRMED and whose startDate is today — ready to go ACTIVE
    @Query("""
            SELECT b FROM Booking b
            WHERE b.status = com.ayush.car_rental_system.booking.entity.Booking.BookingStatus.CONFIRMED
            AND b.startDate <= :today
            """)
    List<Booking> findConfirmedBookingsStartingOn(LocalDate today);

    // Bookings that are ACTIVE and whose endDate has passed — ready to go COMPLETED
    @Query("""
            SELECT b FROM Booking b
            WHERE b.status = com.ayush.car_rental_system.booking.entity.Booking.BookingStatus.ACTIVE
            AND b.endDate < :today
            """)
    List<Booking> findActiveBookingsEndedBefore(LocalDate today);
}
