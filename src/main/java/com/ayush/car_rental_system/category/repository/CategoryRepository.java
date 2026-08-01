package com.ayush.car_rental_system.category.repository;

import com.ayush.car_rental_system.category.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    Page<Category> findAllByIsActiveTrue(Pageable pageable);

    Optional<Category> findByIdAndIsActiveTrue(Long id);
}
