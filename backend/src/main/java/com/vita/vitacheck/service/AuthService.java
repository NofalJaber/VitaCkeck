package com.vita.vitacheck.service;

import com.vita.vitacheck.dto.RegisterRequest;
import com.vita.vitacheck.dto.LoginRequest;
import com.vita.vitacheck.model.User;
import com.vita.vitacheck.repository.UserRepository;


import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public User register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("An account with this email already exists");
        }

        if (userRepository.findByCnp(request.getCnp()).isPresent()) {
            throw new RuntimeException("An account with this CNP already exists");
        }

        if (userRepository.findByPhoneNumber(request.getPhoneNumber()).isPresent()) {
            throw new RuntimeException("An account with this phone number already exists");
        }

        System.out.println("Registering user: " + request.toString());

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .cnp(request.getCnp())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .isMale(request.isMale())
                .address(request.getAddress())
                .age(request.getAge())
                .build();
        
        return userRepository.save(user);
    }

    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        
        return jwtService.generateToken(user);
    }
}
