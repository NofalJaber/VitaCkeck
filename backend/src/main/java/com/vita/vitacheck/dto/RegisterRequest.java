package com.vita.vitacheck.dto;

import com.vita.vitacheck.validation.ValidCNP;
import com.vita.vitacheck.validation.ValidPhoneNumber;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    @ValidCNP
    private String cnp;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    @ValidPhoneNumber
    private String phoneNumber;

    private boolean isMale;
    private String address;
    private Integer age;
}
