package com.ayush.car_rental_system.car.controller;

import com.ayush.car_rental_system.car.dto.CarFilterRequest;
import com.ayush.car_rental_system.car.dto.CarResponse;
import com.ayush.car_rental_system.car.entity.Car;
import com.ayush.car_rental_system.car.service.CarService;
import com.ayush.car_rental_system.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/cars")
@RequiredArgsConstructor
@Tag(name = "Cars", description = "Public car search and listing")
public class CarController {

    private final CarService carService;

    @GetMapping
    @Operation(summary = "Search and filter cars")
    public ResponseEntity<ApiResponse<Page<CarResponse>>> searchCars(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Car.TransmissionType transmission,
            @RequestParam(required = false) Car.FuelType fuelType,
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean isAvailable,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "pricePerDay") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        CarFilterRequest filter = new CarFilterRequest();
        filter.setKeyword(keyword);
        filter.setBrandId(brandId);
        filter.setCategoryId(categoryId);
        filter.setTransmission(transmission);
        filter.setFuelType(fuelType);
        filter.setSeats(seats);
        filter.setMinPrice(minPrice);
        filter.setMaxPrice(maxPrice);
        filter.setIsAvailable(isAvailable);

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return ResponseEntity.ok(ApiResponse.success("Cars fetched",
                carService.searchCars(filter, PageRequest.of(page, size, sort))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get car details by ID")
    public ResponseEntity<ApiResponse<CarResponse>> getCarById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Car fetched", carService.getCarById(id)));
    }
}
