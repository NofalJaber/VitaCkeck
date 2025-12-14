package com.vita.vitacheck.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = CnpValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidCNP {
    String message() default "Invalid CNP";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}