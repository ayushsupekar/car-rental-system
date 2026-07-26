package com.ayush.car_rental_system.booking.controller;

import com.ayush.car_rental_system.booking.dto.BookingResponse;
import com.ayush.car_rental_system.booking.entity.Booking;
import com.ayush.car_rental_system.booking.service.BookingService;
import com.ayush.car_rental_system.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin — Bookings", description = "Admin booking management")
@SecurityRequirement(name = "bearerAuth")
public class AdminBookingController {

    private final BookingService bookingService;

    @GetMapping
    @Operation(summary = "Get all bookings")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return ResponseEntity.ok(ApiResponse.success("Bookings fetched",
                bookingService.getAllBookings(PageRequest.of(page, size, sort))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Booking fetched",
                bookingService.getBookingById(id)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update booking status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam Booking.BookingStatus status) {

        return ResponseEntity.ok(ApiResponse.success("Booking status updated",
                bookingService.updateBookingStatus(id, status)));
    }
}
