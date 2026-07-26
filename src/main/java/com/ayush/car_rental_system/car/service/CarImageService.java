package com.ayush.car_rental_system.car.service;

import com.ayush.car_rental_system.car.dto.CarImageResponse;
import com.ayush.car_rental_system.car.entity.Car;
import com.ayush.car_rental_system.car.entity.CarImage;
import com.ayush.car_rental_system.car.repository.CarImageRepository;
import com.ayush.car_rental_system.car.repository.CarRepository;
import com.ayush.car_rental_system.common.config.CloudinaryService;
import com.ayush.car_rental_system.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CarImageService {

    private final CarRepository carRepository;
    private final CarImageRepository carImageRepository;
    private final CloudinaryService cloudinaryService;

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp"
    );
    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    @Transactional
    public CarImageResponse uploadImage(Long carId, MultipartFile file, boolean isPrimary) {
        Car car = findCarOrThrow(carId);
        validateFile(file);

        Map<String, String> uploadResult = cloudinaryService.upload(file, "car-rental/cars");

        // If this image is set as primary, clear all existing primary flags first
        if (isPrimary) {
            carImageRepository.clearPrimaryForCar(carId);
        }

        // If this is the first image for the car, auto-set it as primary
        boolean setAsPrimary = isPrimary || !carImageRepository.existsByCarId(carId);

        CarImage image = CarImage.builder()
                .imageUrl(uploadResult.get("url"))
                .publicId(uploadResult.get("public_id"))
                .isPrimary(setAsPrimary)
                .car(car)
                .build();

        return toResponse(carImageRepository.save(image));
    }

    @Transactional
    public void deleteImage(Long carId, Long imageId) {
        CarImage image = carImageRepository.findByIdAndCarId(imageId, carId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Image not found with id: " + imageId + " for car: " + carId));

        // Delete from Cloudinary first, then DB
        cloudinaryService.delete(image.getPublicId());
        carImageRepository.delete(image);

        // If we deleted the primary image, promote the first remaining image
        if (image.isPrimary()) {
            carImageRepository.findAll().stream()
                    .filter(img -> img.getCar().getId().equals(carId))
                    .findFirst()
                    .ifPresent(img -> {
                        img.setPrimary(true);
                        carImageRepository.save(img);
                    });
        }
    }

    @Transactional
    public CarImageResponse setPrimaryImage(Long carId, Long imageId) {
        // Verify car exists
        findCarOrThrow(carId);

        CarImage image = carImageRepository.findByIdAndCarId(imageId, carId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Image not found with id: " + imageId + " for car: " + carId));

        // Clear all primary flags for this car, then set the new one
        carImageRepository.clearPrimaryForCar(carId);
        image.setPrimary(true);

        return toResponse(carImageRepository.save(image));
    }

    private Car findCarOrThrow(Long carId) {
        return carRepository.findById(carId)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + carId));
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Only JPEG, PNG, and WebP images are allowed");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("File size must not exceed 5MB");
        }
    }

    private CarImageResponse toResponse(CarImage image) {
        return CarImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .publicId(image.getPublicId())
                .isPrimary(image.isPrimary())
                .build();
    }
}
