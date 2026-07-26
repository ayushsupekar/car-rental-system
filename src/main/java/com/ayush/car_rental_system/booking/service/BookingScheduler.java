package com.ayush.car_rental_system.booking.service;

import com.ayush.car_rental_system.booking.entity.Booking;
import com.ayush.car_rental_system.booking.repository.BookingRepository;
import com.ayush.car_rental_system.car.repository.CarRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BookingScheduler {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;

    // Runs every day at midnight
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void updateBookingStatuses() {
        LocalDate today = LocalDate.now();

        // CONFIRMED → ACTIVE: booking start date has arrived
        List<Booking> toActivate = bookingRepository.findConfirmedBookingsStartingOn(today);
        toActivate.forEach(booking -> {
            booking.setStatus(Booking.BookingStatus.ACTIVE);
            log.info("Booking {} activated for car {}", booking.getId(), booking.getCar().getId());
        });
        bookingRepository.saveAll(toActivate);

        // ACTIVE → COMPLETED: booking end date has passed, free up the car
        List<Booking> toComplete = bookingRepository.findActiveBookingsEndedBefore(today);
        toComplete.forEach(booking -> {
            booking.setStatus(Booking.BookingStatus.COMPLETED);
            booking.getCar().setAvailable(true);
            log.info("Booking {} completed, car {} now available",
                    booking.getId(), booking.getCar().getId());
        });
        bookingRepository.saveAll(toComplete);
    }
}
