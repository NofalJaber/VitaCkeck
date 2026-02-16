package com.vita.vitacheck.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class MedicalTestResponse {
    private Long id;
    private String fileName;
    private String fileType;
    private LocalDateTime uploadDate;
}