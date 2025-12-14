package com.vita.vitacheck.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {

    @Override
    public boolean isValid(String phoneNumber, ConstraintValidatorContext context) {
        if (phoneNumber == null ||
            phoneNumber.length() != 10 ||
            !phoneNumber.substring(0, 2).equals("07")
        ) 
        {
            return false;
        }
        
        return true;
    }
}