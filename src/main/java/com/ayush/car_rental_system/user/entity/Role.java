package com.ayush.car_rental_system.user.entity;

import com.ayush.car_rental_system.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Role extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 30)
    private RoleName name;

    public enum RoleName {
        ROLE_CUSTOMER,
        ROLE_OWNER,
        ROLE_ADMIN
    }
}
