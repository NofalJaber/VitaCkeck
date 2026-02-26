package com.vita.vitacheck.model;

public record MedicalTestItemLimits(
    Double lowerBound,
    Double upperBound,
    String label,
    String status
) {}
