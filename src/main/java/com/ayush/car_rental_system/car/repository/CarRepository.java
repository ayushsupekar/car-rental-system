package com.ayush.car_rental_system.car.repository;

import com.ayush.car_rental_system.car.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface CarRepository extends JpaRepository<Car, Long>,
        JpaSpecificationExecutor<Car> {

    Optional<Car> findByIdAndIsActiveTrue(Long id);

    boolean existsByModelIgnoreCaseAndBrandIdAndYear(String model, Long brandId, Integer year);

    boolean existsByModelIgnoreCaseAndBrandIdAndYearAndIdNot(
            String model, Long brandId, Integer year, Long id);

    // ===== DASHBOARD =====
    long countByIsAvailableTrueAndIsActiveTrue();
    long countByIsAvailableFalseAndIsActiveTrue();
}
