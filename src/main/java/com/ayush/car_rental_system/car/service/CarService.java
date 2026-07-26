package com.ayush.car_rental_system.car.service;

import com.ayush.car_rental_system.brand.entity.Brand;
import com.ayush.car_rental_system.brand.repository.BrandRepository;
import com.ayush.car_rental_system.car.dto.*;
import com.ayush.car_rental_system.car.entity.Car;
import com.ayush.car_rental_system.car.entity.CarImage;
import com.ayush.car_rental_system.car.repository.CarRepository;
import com.ayush.car_rental_system.car.repository.CarSpecification;
import com.ayush.car_rental_system.category.entity.Category;
import com.ayush.car_rental_system.category.repository.CategoryRepository;
import com.ayush.car_rental_system.common.exception.DuplicateResourceException;
import com.ayush.car_rental_system.common.exception.ResourceNotFoundException;
import com.ayush.car_rental_system.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CarService {

    private final CarRepository carRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    // ===== PUBLIC =====

    @Transactional(readOnly = true)
    public Page<CarResponse> searchCars(CarFilterRequest filter, Pageable pageable) {
        Specification<Car> spec = CarSpecification.withFilters(filter);
        return carRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CarResponse getCarById(Long id) {
        Car car = carRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + id));
        return toResponse(car);
    }

    // ===== ADMIN =====

    @Transactional(readOnly = true)
    public Page<CarResponse> getAllCars(Pageable pageable) {
        return carRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public CarResponse createCar(CarRequest request) {
        Brand brand = findBrandOrThrow(request.getBrandId());
        Category category = findCategoryOrThrow(request.getCategoryId());

        if (carRepository.existsByModelIgnoreCaseAndBrandIdAndYear(
                request.getModel(), request.getBrandId(), request.getYear())) {
            throw new DuplicateResourceException(
                    "Car already exists: " + request.getModel() + " (" + request.getYear() + ")");
        }

        Car car = Car.builder()
                .model(request.getModel())
                .year(request.getYear())
                .pricePerDay(request.getPricePerDay())
                .seats(request.getSeats())
                .transmission(request.getTransmission())
                .fuelType(request.getFuelType())
                .description(request.getDescription())
                .brand(brand)
                .category(category)
                .build();

        return toResponse(carRepository.save(car));
    }

    @Transactional
    public CarResponse updateCar(Long id, CarRequest request) {
        Car car = findByIdOrThrow(id);
        Brand brand = findBrandOrThrow(request.getBrandId());
        Category category = findCategoryOrThrow(request.getCategoryId());

        if (carRepository.existsByModelIgnoreCaseAndBrandIdAndYearAndIdNot(
                request.getModel(), request.getBrandId(), request.getYear(), id)) {
            throw new DuplicateResourceException(
                    "Car already exists: " + request.getModel() + " (" + request.getYear() + ")");
        }

        car.setModel(request.getModel());
        car.setYear(request.getYear());
        car.setPricePerDay(request.getPricePerDay());
        car.setSeats(request.getSeats());
        car.setTransmission(request.getTransmission());
        car.setFuelType(request.getFuelType());
        car.setDescription(request.getDescription());
        car.setBrand(brand);
        car.setCategory(category);

        return toResponse(carRepository.save(car));
    }

    @Transactional
    public CarResponse toggleAvailability(Long id) {
        Car car = findByIdOrThrow(id);
        car.setAvailable(!car.isAvailable());
        return toResponse(carRepository.save(car));
    }

    @Transactional
    public void deleteCar(Long id) {
        Car car = findByIdOrThrow(id);
        car.setActive(false);
        carRepository.save(car);
    }

    // ===== HELPERS =====

    private Car findByIdOrThrow(Long id) {
        return carRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Car not found with id: " + id));
    }

    private Brand findBrandOrThrow(Long brandId) {
        return brandRepository.findById(brandId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + brandId));
    }

    private Category findCategoryOrThrow(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
    }

    public CarResponse toResponse(Car car) {
        // Extract primary image URL for listing cards
        String primaryImageUrl = car.getImages().stream()
                .filter(CarImage::isPrimary)
                .map(CarImage::getImageUrl)
                .findFirst()
                // Fall back to first image if no primary is set
                .orElse(car.getImages().isEmpty() ? null : car.getImages().get(0).getImageUrl());

        List<CarImageResponse> images = car.getImages().stream()
                .map(img -> CarImageResponse.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .publicId(img.getPublicId())
                        .isPrimary(img.isPrimary())
                        .build())
                .toList();

        return CarResponse.builder()
                .id(car.getId())
                .model(car.getModel())
                .year(car.getYear())
                .pricePerDay(car.getPricePerDay())
                .seats(car.getSeats())
                .transmission(car.getTransmission())
                .fuelType(car.getFuelType())
                .description(car.getDescription())
                .isAvailable(car.isAvailable())
                .isActive(car.isActive())
                .brandId(car.getBrand().getId())
                .brandName(car.getBrand().getName())
                .brandLogoUrl(car.getBrand().getLogoUrl())
                .categoryId(car.getCategory().getId())
                .categoryName(car.getCategory().getName())
                .primaryImageUrl(primaryImageUrl)
                .images(images)
                .averageRating(reviewRepository.findAverageRatingByCarId(car.getId()) != null
                        ? Math.round(reviewRepository.findAverageRatingByCarId(car.getId()) * 10.0) / 10.0
                        : 0.0)
                .totalReviews(reviewRepository.countByCarId(car.getId()))
                .createdAt(car.getCreatedAt())
                .build();
    }
}
