package com.ayush.car_rental_system.car.entity;

import com.ayush.car_rental_system.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "car_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarImage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Full Cloudinary URL
    @Column(nullable = false)
    private String imageUrl;

    // Cloudinary public_id — needed to delete the image from Cloudinary
    @Column(nullable = false)
    private String publicId;

    // Only one image per car should have isPrimary = true
    @Column(nullable = false)
    @Builder.Default
    private boolean isPrimary = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;
}
