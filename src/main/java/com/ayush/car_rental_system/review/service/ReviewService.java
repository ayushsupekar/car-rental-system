package com.ayush.car_rental_system.review.service;

import com.ayush.car_rental_system.booking.entity.Booking;
import com.ayush.car_rental_system.booking.repository.BookingRepository;
import com.ayush.car_rental_system.car.entity.Car;
import com.ayush.car_rental_system.car.repository.CarRepository;
import com.ayush.car_rental_system.common.exception.DuplicateResourceException;
import com.ayush.car_rental_system.common.exception.ResourceNotFoundException;
import com.ayush.car_rental_system.review.dto.*;
import com.ayush.car_rental_system.review.entity.Review;
import com.ayush.car_rental_system.review.repository.ReviewRepository;
import com.ayush.car_rental_system.user.entity.User;
import com.ayush.car_rental_system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponse createReview(String userEmail, ReviewRequest request) {
        User user = findUserOrThrow(userEmail);
        Booking booking = findBookingOrThrow(request.getBookingId());

        // Rule 1: booking must belong to the requesting user
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException(
                    "You can only review your own bookings");
        }

        // Rule 2: booking must be COMPLETED
        if (booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new IllegalStateException(
                    "You can only review completed bookings. Current status: "
                            + booking.getStatus());
        }

        // Rule 3: one review per booking
        if (reviewRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new DuplicateResourceException(
                    "You have already reviewed this booking");
        }

        // Rule 4: one review per user per car (DB unique constraint backup)
        if (reviewRepository.existsByUserIdAndCarId(user.getId(), booking.getCar().getId())) {
            throw new DuplicateResourceException(
                    "You have already reviewed this car");
        }

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .user(user)
                .car(booking.getCar())
                .booking(booking)
                .build();

        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse updateReview(String userEmail, Long reviewId,
                                       UpdateReviewRequest request) {
        User user = findUserOrThrow(userEmail);

        Review review = reviewRepository.findByIdAndUserId(reviewId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Review not found with id: " + reviewId));

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void deleteMyReview(String userEmail, Long reviewId) {
        User user = findUserOrThrow(userEmail);

        Review review = reviewRepository.findByIdAndUserId(reviewId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Review not found with id: " + reviewId));

        reviewRepository.delete(review);
    }

    // ===== PUBLIC READ =====

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByCarId(Long carId, Pageable pageable) {
        // Verify car exists
        if (!carRepository.existsById(carId)) {
            throw new ResourceNotFoundException("Car not found with id: " + carId);
        }
        return reviewRepository.findAllByCarId(carId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CarRatingResponse getCarRating(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Car not found with id: " + carId));

        Double avg = reviewRepository.findAverageRatingByCarId(carId);
        Long count = reviewRepository.countByCarId(carId);

        return CarRatingResponse.builder()
                .carId(carId)
                .carModel(car.getModel())
                // Round to 1 decimal place, default 0.0 if no reviews
                .averageRating(avg != null
                        ? Math.round(avg * 10.0) / 10.0
                        : 0.0)
                .totalReviews(count)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getMyReviews(String userEmail, Pageable pageable) {
        User user = findUserOrThrow(userEmail);
        return reviewRepository.findAllByUserId(user.getId(), pageable)
                .map(this::toResponse);
    }

    // ===== ADMIN =====

    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Review not found with id: " + reviewId));
        reviewRepository.delete(review);
    }

    // ===== HELPERS =====

    private User findUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found: " + email));
    }

    private Booking findBookingOrThrow(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with id: " + bookingId));
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .userId(review.getUser().getId())
                .reviewerName(review.getUser().getFirstName()
                        + " " + review.getUser().getLastName())
                .carId(review.getCar().getId())
                .carModel(review.getCar().getModel())
                .brandName(review.getCar().getBrand().getName())
                .bookingId(review.getBooking().getId())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
