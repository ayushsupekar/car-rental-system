package com.ayush.car_rental_system.brand.controller;

import com.ayush.car_rental_system.brand.dto.BrandRequest;
import com.ayush.car_rental_system.brand.dto.BrandResponse;
import com.ayush.car_rental_system.brand.service.BrandService;
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
@RequestMapping("/api/v1/admin/brands")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin — Brands", description = "Admin brand management")
@SecurityRequirement(name = "bearerAuth")
public class AdminBrandController {

    private final BrandService brandService;

    @GetMapping
    @Operation(summary = "Get all brands including inactive")
    public ResponseEntity<ApiResponse<Page<BrandResponse>>> getAllBrands(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        return ResponseEntity.ok(ApiResponse.success("Brands fetched",
                brandService.getAllBrands(PageRequest.of(page, size, sort))));
    }

    @PostMapping
    @Operation(summary = "Create a new brand")
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(
            @Valid @RequestBody BrandRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Brand created", brandService.createBrand(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a brand")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(
            @PathVariable Long id,
            @Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Brand updated",
                brandService.updateBrand(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete a brand")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.success("Brand deleted"));
    }
}
