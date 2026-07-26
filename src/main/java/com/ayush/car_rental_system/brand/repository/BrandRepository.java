package com.ayush.car_rental_system.brand.repository;

import com.ayush.car_rental_system.brand.entity.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    // Public listing only shows active brands
    Page<Brand> findAllByIsActiveTrue(Pageable pageable);

    Optional<Brand> findByIdAndIsActiveTrue(Long id);
}
