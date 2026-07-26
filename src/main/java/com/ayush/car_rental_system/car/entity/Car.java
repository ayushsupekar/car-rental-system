package com.ayush.car_rental_system.car.entity;

import com.ayush.car_rental_system.brand.entity.Brand;
import com.ayush.car_rental_system.category.entity.Category;
import com.ayush.car_rental_system.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cars")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Car extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(nullable = false)
    private Integer year;

    // Price per day in the system currency
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerDay;

    @Column(nullable = false)
    private Integer seats;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransmissionType transmission;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FuelType fuelType;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private boolean isAvailable = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CarImage> images = new ArrayList<>();

    public enum TransmissionType {
        MANUAL, AUTOMATIC
    }

    public enum FuelType {
        PETROL, DIESEL, ELECTRIC, HYBRID
    }
}
