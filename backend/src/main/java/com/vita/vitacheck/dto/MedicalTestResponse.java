package com.vita.vitacheck.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MedicalTestResponse {
    private Long id;
    private String fileName;
    private String fileType;
    private LocalDateTime uploadDate;
}