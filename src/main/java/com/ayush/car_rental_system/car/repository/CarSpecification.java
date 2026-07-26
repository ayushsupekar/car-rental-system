package com.ayush.car_rental_system.car.repository;

import com.ayush.car_rental_system.car.dto.CarFilterRequest;
import com.ayush.car_rental_system.car.entity.Car;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class CarSpecification {

    private CarSpecification() {}

    public static Specification<Car> withFilters(CarFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always filter to active cars only for public listing
            predicates.add(cb.isTrue(root.get("isActive")));

            if (filter.getKeyword() != null && !filter.getKeyword().isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("model")),
                        "%" + filter.getKeyword().toLowerCase() + "%"
                ));
            }

            if (filter.getBrandId() != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), filter.getBrandId()));
            }

            if (filter.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), filter.getCategoryId()));
            }

            if (filter.getTransmission() != null) {
                predicates.add(cb.equal(root.get("transmission"), filter.getTransmission()));
            }

            if (filter.getFuelType() != null) {
                predicates.add(cb.equal(root.get("fuelType"), filter.getFuelType()));
            }

            if (filter.getSeats() != null) {
                predicates.add(cb.equal(root.get("seats"), filter.getSeats()));
            }

            if (filter.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("pricePerDay"), filter.getMinPrice()));
            }

            if (filter.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("pricePerDay"), filter.getMaxPrice()));
            }

            if (filter.getIsAvailable() != null) {
                predicates.add(cb.equal(root.get("isAvailable"), filter.getIsAvailable()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
