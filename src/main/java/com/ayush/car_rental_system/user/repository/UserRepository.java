package com.ayush.car_rental_system.user.repository;

import com.ayush.car_rental_system.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // ===== DASHBOARD =====

    long countByIsActiveTrue();

    @Query("""
            SELECT COUNT(u) FROM User u
            WHERE u.createdAt >= :start AND u.createdAt < :end
            """)
    long countNewUsersInPeriod(@Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end);
}
