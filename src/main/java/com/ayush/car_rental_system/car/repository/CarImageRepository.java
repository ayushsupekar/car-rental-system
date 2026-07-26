package com.ayush.car_rental_system.car.repository;

import com.ayush.car_rental_system.car.entity.CarImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CarImageRepository extends JpaRepository<CarImage, Long> {

    Optional<CarImage> findByIdAndCarId(Long imageId, Long carId);

    // Unset all primary flags for a car before setting a new primary
    @Modifying
    @Query("UPDATE CarImage ci SET ci.isPrimary = false WHERE ci.car.id = :carId")
    void clearPrimaryForCar(Long carId);

    boolean existsByCarId(Long carId);
}
