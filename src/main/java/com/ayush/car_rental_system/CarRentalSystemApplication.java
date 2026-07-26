package com.ayush.car_rental_system;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@Slf4j
@SpringBootApplication
public class CarRentalSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(CarRentalSystemApplication.class, args);
        log.info("Car Rental System started successfully");
    }
}
