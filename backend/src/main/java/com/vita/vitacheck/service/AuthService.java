package com.vita.vitacheck.service;

import com.vita.vitacheck.dto.RegisterRequest;
import com.vita.vitacheck.dto.LoginRequest;
import com.vita.vitacheck.model.PasswordResetToken;
import com.vita.vitacheck.model.User;
import com.vita.vitacheck.repository.PasswordResetTokenRepository;
import com.vita.vitacheck.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

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

    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("If this email exists, a reset link has been sent.")); 
                
        // Delete any existing unused tokens for this user
        tokenRepository.deleteByUser_Id(user.getId());

        // Generate a secure random token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        tokenRepository.save(resetToken);

        final String userEmail = user.getEmail();
        CompletableFuture.runAsync(() -> {
            try {
                emailService.sendPasswordResetEmail(userEmail, token);
            } catch (Exception e) {
                System.err.println("Eroare la trimiterea emailului in fundal: " + e.getMessage());
            }
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired password reset token."));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Password reset token has expired.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Delete token so it can't be used again
        tokenRepository.delete(resetToken);
    }
}