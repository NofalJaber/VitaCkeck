package com.vita.vitacheck.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "medical_tests")
public class MedicalTest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String fileName;
    private String fileType;
    private LocalDateTime uploadDate;

    // Use bytea for PostgreSQL instead of LONGBLOB
    // We removed @Lob to avoid needing @Transactional just to read the file
    @Column(columnDefinition = "bytea")
    private byte[] data;
}