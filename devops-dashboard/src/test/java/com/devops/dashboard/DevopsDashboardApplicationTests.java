package com.devops.dashboard;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class DevopsDashboardApplicationTests {

	@Test
	void contextLoads() {
	}

	@Test
	void testPasswordMatchesConfiguredBCrypt() {
		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
		String seedHash = "$2a$10$nlWP9a1dVcvgElZoxM6uhuWSbns/XYP1qIEtZQ41XgrKAjT1lrJD2";
		assertTrue(encoder.matches("password123", seedHash), "Seed hash must match 'password123'");
	}
}
