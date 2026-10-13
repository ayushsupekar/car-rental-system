package com.ayush.car_rental_system.common.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.Map;

public class DatabaseUrlPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String url = environment.getProperty("spring.datasource.url");
        if (url != null && url.startsWith("postgresql://")) {
            String jdbcUrl = "jdbc:postgresql://" + url.substring("postgresql://".length());
            environment.getPropertySources().addFirst(
                new MapPropertySource("databaseUrlFix", Map.of("spring.datasource.url", jdbcUrl))
            );
        }
    }
}
