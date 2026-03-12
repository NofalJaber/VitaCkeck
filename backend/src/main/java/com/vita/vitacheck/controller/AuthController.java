package com.vita.vitacheck.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.vita.vitacheck.dto.RegisterRequest;
import com.vita.vitacheck.dto.ResetPasswordRequest;
import com.vita.vitacheck.dto.ForgotPasswordRequest;
import com.vita.vitacheck.dto.LoginRequest;
import com.vita.vitacheck.service.AuthService;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        try{
            authService.register(request);
            return ResponseEntity.ok("User registered successfully");
        }
        catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest request) {
        try{
            String token = authService.login(request);
            return ResponseEntity.ok(Collections.singletonMap("token", token));
        }
        catch (RuntimeException e){
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            authService.requestPasswordReset(request.getEmail());
            return ResponseEntity.ok(Collections.singletonMap("message", "If an account exists with that email, a reset link has been sent."));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(Collections.singletonMap("message", "If an account exists with that email, a reset link has been sent."));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(Collections.singletonMap("message", "Password successfully reset. You can now log in."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
