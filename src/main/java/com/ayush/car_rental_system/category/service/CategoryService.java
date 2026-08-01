package com.ayush.car_rental_system.category.service;

import com.ayush.car_rental_system.category.dto.CategoryRequest;
import com.ayush.car_rental_system.category.dto.CategoryResponse;
import com.ayush.car_rental_system.category.entity.Category;
import com.ayush.car_rental_system.category.repository.CategoryRepository;
import com.ayush.car_rental_system.common.exception.DuplicateResourceException;
import com.ayush.car_rental_system.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<CategoryResponse> getAllActiveCategories(Pageable pageable) {
        return categoryRepository.findAllByIsActiveTrue(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CategoryResponse getActiveCategoryById(Long id) {
        Category category = categoryRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return toResponse(category);
    }

    // ===== ADMIN OPERATIONS =====

    @Transactional(readOnly = true)
    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Category already exists: " + request.getName());
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findByIdOrThrow(id);

        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new DuplicateResourceException("Category name already in use: " + request.getName());
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = findByIdOrThrow(id);
        category.setActive(false);
        categoryRepository.save(category);
    }

    private Category findByIdOrThrow(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .isActive(category.isActive())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
