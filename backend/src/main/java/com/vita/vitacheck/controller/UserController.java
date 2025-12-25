package com.vita.vitacheck.controller;

import com.vita.vitacheck.dto.ProfileUpdateRequest;
import com.vita.vitacheck.dto.UserResponse;
import com.vita.vitacheck.model.User;
import com.vita.vitacheck.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getUserProfile(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateUserProfile(@AuthenticationPrincipal User user,
            @Valid @RequestBody ProfileUpdateRequest request) {

        try {
            userService.updateUserProfile(user, request);
            return ResponseEntity.ok("User profile updated successfully");
        }

        catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}