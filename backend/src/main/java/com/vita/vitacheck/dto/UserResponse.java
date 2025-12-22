package com.vita.vitacheck.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {

    private String email;
    private String cnp;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private boolean isMale;
    private String address;
    private Integer age;
}
