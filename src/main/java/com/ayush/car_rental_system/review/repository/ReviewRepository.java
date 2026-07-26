package com.ayush.car_rental_system.review.repository;

import com.ayush.car_rental_system.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findAllByCarId(Long carId, Pageable pageable);

    Page<Review> findAllByUserId(Long userId, Pageable pageable);

    Optional<Review> findByBookingId(Long bookingId);

    boolean existsByUserIdAndCarId(Long userId, Long carId);

    Optional<Review> findByIdAndUserId(Long reviewId, Long userId);

    // Computes average rating for a car — returns null if no reviews exist
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.car.id = :carId")
    Double findAverageRatingByCarId(Long carId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.car.id = :carId")
    Long countByCarId(Long carId);
}
