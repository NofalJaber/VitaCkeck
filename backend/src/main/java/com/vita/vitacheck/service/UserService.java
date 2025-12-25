package com.vita.vitacheck.service;

import com.vita.vitacheck.dto.ProfileUpdateRequest;
import com.vita.vitacheck.dto.UserResponse;
import com.vita.vitacheck.model.User;
import com.vita.vitacheck.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getUserProfile(User user) {
        return UserResponse.builder()
                .email(user.getEmail())
                .cnp(user.getCnp())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .isMale(user.isMale())
                .address(user.getAddress())
                .age(user.getAge())
                .build();
    }

    @Transactional
    public void updateUserProfile(User user, ProfileUpdateRequest updatedUser) {

        userRepository.findByCnp(updatedUser.getCnp())
                .ifPresent(existingUser -> {
                    if (!existingUser.getId().equals(user.getId())) {
                        throw new RuntimeException("This CNP is already associated with another account");
                    }
                });

        userRepository.findByPhoneNumber(updatedUser.getPhoneNumber())
                .ifPresent(existingUser -> {
                    if (!existingUser.getId().equals(user.getId())) {
                        throw new RuntimeException("This phone number is already associated with another account");
                    }
                });
        user.setCnp(updatedUser.getCnp());
        user.setFirstName(updatedUser.getFirstName());
        user.setLastName(updatedUser.getLastName());
        user.setPhoneNumber(updatedUser.getPhoneNumber());
        user.setMale(updatedUser.isMale());
        user.setAddress(updatedUser.getAddress());
        user.setAge(updatedUser.getAge());
        userRepository.save(user);
    }
}
