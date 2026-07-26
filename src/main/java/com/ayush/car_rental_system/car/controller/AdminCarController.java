package com.ayush.car_rental_system.car.controller;

import com.ayush.car_rental_system.car.dto.CarRequest;
import com.ayush.car_rental_system.car.dto.CarResponse;
import com.ayush.car_rental_system.car.service.CarService;
import com.ayush.car_rental_system.common.response.ApiResponse;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/cars")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin — Cars", description = "Admin car management")
@SecurityRequirement(name = "bearerAuth")
public class AdminCarController {

    private final CarService carService;

    @GetMapping
    @Operation(summary = "Get all cars including inactive")
    public ResponseEntity<ApiResponse<Page<CarResponse>>> getAllCars(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return ResponseEntity.ok(ApiResponse.success("Cars fetched",
                carService.getAllCars(PageRequest.of(page, size, sort))));
    }

    @PostMapping
    @Operation(summary = "Create a new car")
    public ResponseEntity<ApiResponse<CarResponse>> createCar(@Valid @RequestBody CarRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Car created", carService.createCar(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a car")
    public ResponseEntity<ApiResponse<CarResponse>> updateCar(
            @PathVariable Long id,
            @Valid @RequestBody CarRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Car updated", carService.updateCar(id, request)));
    }

    @PatchMapping("/{id}/toggle-availability")
    @Operation(summary = "Toggle car availability")
    public ResponseEntity<ApiResponse<CarResponse>> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Availability updated",
                carService.toggleAvailability(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete a car")
    public ResponseEntity<ApiResponse<Void>> deleteCar(@PathVariable Long id) {
        carService.deleteCar(id);
        return ResponseEntity.ok(ApiResponse.success("Car deleted"));
    }
}
