package com.ayush.car_rental_system.payment.controller;

import com.ayush.car_rental_system.common.response.ApiResponse;
import com.ayush.car_rental_system.payment.dto.PaymentResponse;
import com.ayush.car_rental_system.payment.service.PaymentService;
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
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin — Payments", description = "Admin payment management")
@SecurityRequirement(name = "bearerAuth")
public class AdminPaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @Operation(summary = "Get all payments")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return ResponseEntity.ok(ApiResponse.success("Payments fetched",
                paymentService.getAllPayments(PageRequest.of(page, size, sort))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Payment fetched",
                paymentService.getPaymentById(id)));
    }

    @PatchMapping("/{id}/fail")
    @Operation(summary = "Mark a payment as failed")
    public ResponseEntity<ApiResponse<PaymentResponse>> failPayment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Payment marked as failed",
                paymentService.failPayment(id)));
    }

    @PatchMapping("/{id}/refund")
    @Operation(summary = "Refund a successful payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> refundPayment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Payment refunded",
                paymentService.refundPayment(id)));
    }
}
