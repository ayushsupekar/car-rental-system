package com.ayush.car_rental_system;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
	"spring.datasource.url=jdbc:tc:postgresql:15:///car_rental_db",
	"spring.datasource.driver-class-name=org.testcontainers.jdbc.ContainerDatabaseDriver",
	"spring.jpa.hibernate.ddl-auto=create-drop"
})
class CarRentalSystemApplicationTests {

	@Test
	void contextLoads() {
	}

}
