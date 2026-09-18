package com.java.kr.ac.kangwon;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Rodos2ServerApplication {
	private static final Logger logger = LoggerFactory.getLogger(Rodos2ServerApplication.class);
	public static void main(String[] args) {
		SpringApplication.run(Rodos2ServerApplication.class, args);
		logger.info("Rodos2 Server Application started");
	}
}