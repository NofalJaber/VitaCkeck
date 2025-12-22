package com.vita.vitacheck.service;

import com.vita.vitacheck.dto.UserResponse;
import com.vita.vitacheck.model.User;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    public UserResponse getUserProfile (User user){
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
}
