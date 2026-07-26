package com.ayush.car_rental_system.booking.entity;

import com.ayush.car_rental_system.car.entity.Car;
import com.ayush.car_rental_system.common.entity.BaseEntity;
import com.ayush.car_rental_system.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    // Snapshot of price at booking time — car price may change later
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @Column(length = 500)
    private String cancellationReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    public enum BookingStatus {
        PENDING,      // Created, awaiting payment
        CONFIRMED,    // Payment received
        ACTIVE,       // Car picked up
        COMPLETED,    // Car returned
        CANCELLED     // Cancelled by user or admin
    }
}
