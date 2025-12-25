package com.vita.vitacheck.dto;

import com.vita.vitacheck.validation.ValidCNP;
import com.vita.vitacheck.validation.ValidPhoneNumber;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    
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

    @NotNull
    private boolean isMale;

    @NotBlank
    private String address;
    
    @NotNull
    private Integer age;
}
