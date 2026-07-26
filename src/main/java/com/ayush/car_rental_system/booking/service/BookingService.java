package com.ayush.car_rental_system.booking.service;

import com.ayush.car_rental_system.booking.dto.BookingRequest;
import com.ayush.car_rental_system.booking.dto.BookingResponse;
import com.ayush.car_rental_system.booking.dto.CancelBookingRequest;
import com.ayush.car_rental_system.booking.entity.Booking;
import com.ayush.car_rental_system.booking.repository.BookingRepository;
import com.ayush.car_rental_system.car.entity.Car;
import com.ayush.car_rental_system.car.entity.CarImage;
import com.ayush.car_rental_system.car.repository.CarRepository;
import com.ayush.car_rental_system.common.exception.ResourceNotFoundException;
import com.ayush.car_rental_system.user.entity.User;
import com.ayush.car_rental_system.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    // Only these statuses can be cancelled
    private static final EnumSet<Booking.BookingStatus> CANCELLABLE_STATUSES =
            EnumSet.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.CONFIRMED);

    @Transactional
    public BookingResponse createBooking(String userEmail, BookingRequest request) {
        User user = findUserOrThrow(userEmail);
        Car car = carRepository.findByIdAndIsActiveTrue(request.getCarId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Car not found with id: " + request.getCarId()));

        validateBookingDates(request.getStartDate(), request.getEndDate());

        if (!car.isAvailable()) {
            throw new IllegalStateException("Car is not available for booking");
        }

        if (bookingRepository.existsOverlappingBooking(
                car.getId(), request.getStartDate(), request.getEndDate())) {
            throw new IllegalStateException(
                    "Car is already booked for the selected dates");
        }

        long totalDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        BigDecimal totalPrice = car.getPricePerDay()
                .multiply(BigDecimal.valueOf(totalDays));

        Booking booking = Booking.builder()
                .user(user)
                .car(car)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalPrice(totalPrice)
                .status(Booking.BookingStatus.PENDING)
                .build();

        // Mark car unavailable immediately to prevent race conditions
        car.setAvailable(false);
        carRepository.save(car);

        return toResponse(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> getMyBookings(String userEmail, Pageable pageable) {
        User user = findUserOrThrow(userEmail);
        return bookingRepository.findAllByUserId(user.getId(), pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public BookingResponse getMyBookingById(String userEmail, Long bookingId) {
        User user = findUserOrThrow(userEmail);
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with id: " + bookingId));
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(String userEmail, Long bookingId,
                                         CancelBookingRequest request) {
        User user = findUserOrThrow(userEmail);
        Booking booking = bookingRepository.findByIdAndUserId(bookingId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with id: " + bookingId));

        if (!CANCELLABLE_STATUSES.contains(booking.getStatus())) {
            throw new IllegalStateException(
                    "Cannot cancel a booking with status: " + booking.getStatus());
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationReason(request.getReason());

        // Free up the car when booking is cancelled
        booking.getCar().setAvailable(true);
        carRepository.save(booking.getCar());

        return toResponse(bookingRepository.save(booking));
    }

    // ===== ADMIN =====

    @Transactional(readOnly = true)
    public Page<BookingResponse> getAllBookings(Pageable pageable) {
        return bookingRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId) {
        return toResponse(findByIdOrThrow(bookingId));
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId,
                                               Booking.BookingStatus newStatus) {
        Booking booking = findByIdOrThrow(bookingId);
        validateStatusTransition(booking.getStatus(), newStatus);
        booking.setStatus(newStatus);

        // When admin confirms a booking, car stays unavailable
        // When admin cancels, free the car
        if (newStatus == Booking.BookingStatus.CANCELLED) {
            booking.getCar().setAvailable(true);
            carRepository.save(booking.getCar());
        }

        return toResponse(bookingRepository.save(booking));
    }

    // ===== PRIVATE HELPERS =====

    private void validateBookingDates(LocalDate startDate, LocalDate endDate) {
        if (!endDate.isAfter(startDate)) {
            throw new IllegalArgumentException("End date must be after start date");
        }
        if (ChronoUnit.DAYS.between(startDate, endDate) < 1) {
            throw new IllegalArgumentException("Minimum booking duration is 1 day");
        }
    }

    private void validateStatusTransition(Booking.BookingStatus current,
                                          Booking.BookingStatus next) {
        boolean valid = switch (current) {
            case PENDING -> next == Booking.BookingStatus.CONFIRMED
                    || next == Booking.BookingStatus.CANCELLED;
            case CONFIRMED -> next == Booking.BookingStatus.ACTIVE
                    || next == Booking.BookingStatus.CANCELLED;
            case ACTIVE -> next == Booking.BookingStatus.COMPLETED;
            default -> false;
        };

        if (!valid) {
            throw new IllegalStateException(
                    "Invalid status transition: " + current + " → " + next);
        }
    }

    private User findUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Booking findByIdOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with id: " + id));
    }

    public BookingResponse toResponse(Booking booking) {
        Car car = booking.getCar();

        String primaryImageUrl = car.getImages().stream()
                .filter(CarImage::isPrimary)
                .map(CarImage::getImageUrl)
                .findFirst()
                .orElse(car.getImages().isEmpty() ? null
                        : car.getImages().get(0).getImageUrl());

        long totalDays = ChronoUnit.DAYS.between(
                booking.getStartDate(), booking.getEndDate());

        return BookingResponse.builder()
                .id(booking.getId())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .totalDays((int) totalDays)
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .cancellationReason(booking.getCancellationReason())
                .userId(booking.getUser().getId())
                .userFullName(booking.getUser().getFirstName()
                        + " " + booking.getUser().getLastName())
                .userEmail(booking.getUser().getEmail())
                .carId(car.getId())
                .carModel(car.getModel())
                .carYear(car.getYear())
                .brandName(car.getBrand().getName())
                .primaryImageUrl(primaryImageUrl)
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
