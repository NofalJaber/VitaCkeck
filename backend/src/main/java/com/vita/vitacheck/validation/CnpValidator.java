package com.vita.vitacheck.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CnpValidator implements ConstraintValidator<ValidCNP, String> {

    @Override
    public boolean isValid(String cnp, ConstraintValidatorContext context) {
        if (cnp == null || cnp.length() != 13 || !cnp.matches("\\d+")) {
            return false;
        }

        // --- Standard Romanian CNP Validation Logic ---
        int[] controlKey = {2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9};
        long sum = 0;
        
        for (int i = 0; i < 12; i++) {
            sum += Character.getNumericValue(cnp.charAt(i)) * controlKey[i];
        }
        
        long remainder = sum % 11;
        int checkDigit = (remainder == 10) ? 1 : (int) remainder;
        int actualCheckDigit = Character.getNumericValue(cnp.charAt(12));

        return checkDigit == actualCheckDigit;
    }
}