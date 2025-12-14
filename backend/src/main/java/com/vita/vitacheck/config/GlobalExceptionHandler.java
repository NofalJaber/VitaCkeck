package com.vita.vitacheck.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationErrors(MethodArgumentNotValidException ex) {
        // 1. Get all validation errors found by Spring
        // 2. Extract the message from the FIRST error in the list
        String firstErrorMessage = ex.getBindingResult()
                .getAllErrors()
                .get(0)
                .getDefaultMessage();

        // 3. Return just that string with a 400 Bad Request status
        return ResponseEntity
                .badRequest()
                .body(firstErrorMessage);
    }
}