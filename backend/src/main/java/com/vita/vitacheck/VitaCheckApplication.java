package com.vita.vitacheck;

import io.github.cdimascio.dotenv.Dotenv; // Import this
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class VitaCheckApplication {

    public static void main(String[] args) {
        // 1. Load the .env file
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing() // Don't crash if file is missing (e.g. in production)
                .load();

        // 2. Feed the variables into Java's System Properties
        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });

        // 3. Start Spring Boot
        SpringApplication.run(VitaCheckApplication.class, args);
    }
}