package com.vita.vitacheck.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for development (often not needed for stateless APIs)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll() // Allow access to your API endpoints
                .anyRequest().authenticated() // Secure everything else
            );
        return http.build();
    }
}