package com.ayush.car_rental_system.car.controller;

import com.ayush.car_rental_system.car.dto.CarImageResponse;
import com.ayush.car_rental_system.car.service.CarImageService;
import com.ayush.car_rental_system.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/cars/{carId}/images")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin — Car Images", description = "Car image management via Cloudinary")
@SecurityRequirement(name = "bearerAuth")
public class AdminCarImageController {

    private final CarImageService carImageService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload an image for a car")
    public ResponseEntity<ApiResponse<CarImageResponse>> uploadImage(
            @PathVariable Long carId,
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean isPrimary) {

        CarImageResponse response = carImageService.uploadImage(carId, file, isPrimary);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Image uploaded", response));
    }

    @DeleteMapping("/{imageId}")
    @Operation(summary = "Delete a car image")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable Long carId,
            @PathVariable Long imageId) {

        carImageService.deleteImage(carId, imageId);
        return ResponseEntity.ok(ApiResponse.success("Image deleted"));
    }

    @PatchMapping("/{imageId}/set-primary")
    @Operation(summary = "Set an image as the primary image for a car")
    public ResponseEntity<ApiResponse<CarImageResponse>> setPrimary(
            @PathVariable Long carId,
            @PathVariable Long imageId) {

        CarImageResponse response = carImageService.setPrimaryImage(carId, imageId);
        return ResponseEntity.ok(ApiResponse.success("Primary image updated", response));
    }
}
