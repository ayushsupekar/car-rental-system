package com.ayush.car_rental_system.common.config;

import com.ayush.car_rental_system.user.entity.Role;
import com.ayush.car_rental_system.user.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        Arrays.stream(Role.RoleName.values()).forEach(roleName -> {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(new Role(null, roleName));
                log.info("Seeded role: {}", roleName);
            }
        });
    }
}
