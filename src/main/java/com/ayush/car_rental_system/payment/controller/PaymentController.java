package com.ayush.car_rental_system.payment.controller;

import com.ayush.car_rental_system.common.response.ApiResponse;
import com.ayush.car_rental_system.payment.dto.PaymentRequest;
import com.ayush.car_rental_system.payment.dto.PaymentResponse;
import com.ayush.car_rental_system.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment operations")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Initiate payment for a booking")
    public ResponseEntity<ApiResponse<PaymentResponse>> initiatePayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PaymentRequest request) {

        PaymentResponse response = paymentService.initiatePayment(
                userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment initiated", response));
    }

    // Simulates gateway success — in production this endpoint is called
    // by your frontend after receiving success from Razorpay/Stripe SDK
    @PostMapping("/{id}/confirm")
    @Operation(summary = "Confirm a payment (simulate gateway success)")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmPayment(
            @PathVariable Long id,
            @RequestParam(required = false) String transactionId) {

        return ResponseEntity.ok(ApiResponse.success("Payment confirmed",
                paymentService.confirmPayment(id, transactionId)));
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get payment for a specific booking")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long bookingId) {

        return ResponseEntity.ok(ApiResponse.success("Payment fetched",
                paymentService.getPaymentByBookingId(userDetails.getUsername(), bookingId)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get all my payments")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getMyPayments(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return ResponseEntity.ok(ApiResponse.success("Payments fetched",
                paymentService.getMyPayments(
                        userDetails.getUsername(), PageRequest.of(page, size, sort))));
    }
}
