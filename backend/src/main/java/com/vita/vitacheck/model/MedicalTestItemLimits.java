package com.vita.vitacheck.model;

import jakarta.persistence.Convert;
import com.vita.vitacheck.config.StringEncryptionConverter;

public record MedicalTestItemLimits(
    Double lowerBound,
    Double upperBound,

    @Convert(converter = StringEncryptionConverter.class)
    String label,

    @Convert(converter = StringEncryptionConverter.class)
    String status
) {}
