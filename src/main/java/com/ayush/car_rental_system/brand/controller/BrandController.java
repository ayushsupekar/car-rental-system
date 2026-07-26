package com.ayush.car_rental_system.brand.controller;

import com.ayush.car_rental_system.brand.dto.BrandResponse;
import com.ayush.car_rental_system.brand.service.BrandService;
import com.ayush.car_rental_system.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
@Tag(name = "Brands", description = "Public brand listing")
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    @Operation(summary = "Get all active brands")
    public ResponseEntity<ApiResponse<Page<BrandResponse>>> getAllBrands(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return ResponseEntity.ok(ApiResponse.success("Brands fetched",
                brandService.getAllActiveBrands(PageRequest.of(page, size, sort))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get brand by ID")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Brand fetched",
                brandService.getActiveBrandById(id)));
    }
}
