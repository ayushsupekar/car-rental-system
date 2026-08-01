package com.ayush.car_rental_system.brand.service;

import com.ayush.car_rental_system.brand.dto.BrandRequest;
import com.ayush.car_rental_system.brand.dto.BrandResponse;
import com.ayush.car_rental_system.brand.entity.Brand;
import com.ayush.car_rental_system.brand.repository.BrandRepository;
import com.ayush.car_rental_system.common.exception.DuplicateResourceException;
import com.ayush.car_rental_system.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;

    @Transactional(readOnly = true)
    public Page<BrandResponse> getAllActiveBrands(Pageable pageable) {
        return brandRepository.findAllByIsActiveTrue(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public BrandResponse getActiveBrandById(Long id) {
        Brand brand = brandRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
        return toResponse(brand);
    }

    // ===== ADMIN OPERATIONS =====

    @Transactional(readOnly = true)
    public Page<BrandResponse> getAllBrands(Pageable pageable) {
        return brandRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public BrandResponse createBrand(BrandRequest request) {
        if (brandRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Brand already exists: " + request.getName());
        }

        Brand brand = Brand.builder()
                .name(request.getName())
                .logoUrl(request.getLogoUrl())
                .build();

        return toResponse(brandRepository.save(brand));
    }

    @Transactional
    public BrandResponse updateBrand(Long id, BrandRequest request) {
        Brand brand = findByIdOrThrow(id);

        // Check duplicate name but exclude the current brand being updated
        if (brandRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new DuplicateResourceException("Brand name already in use: " + request.getName());
        }

        brand.setName(request.getName());
        brand.setLogoUrl(request.getLogoUrl());

        return toResponse(brandRepository.save(brand));
    }

    @Transactional
    public void deleteBrand(Long id) {
        Brand brand = findByIdOrThrow(id);
        // Soft delete — preserves car history that references this brand
        brand.setActive(false);
        brandRepository.save(brand);
    }

    private Brand findByIdOrThrow(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
    }

    private BrandResponse toResponse(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .logoUrl(brand.getLogoUrl())
                .isActive(brand.isActive())
                .createdAt(brand.getCreatedAt())
                .build();
    }
}
