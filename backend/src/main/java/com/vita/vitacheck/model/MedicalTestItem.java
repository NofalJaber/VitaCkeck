package com.vita.vitacheck.model;

import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.vita.vitacheck.config.StringEncryptionConverter;
import com.vita.vitacheck.config.LimitsEncryptionConverter;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "medical_test_items")
public class MedicalTestItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medical_test_id", nullable = false)
    private MedicalTest medicalTest;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = StringEncryptionConverter.class)
    private String testName;

    private Double numericValue;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = StringEncryptionConverter.class)
    private String stringValue;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = StringEncryptionConverter.class)
    private String unit;

    private Double minReference;
    private Double maxReference;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = StringEncryptionConverter.class)
    private String textReference;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = LimitsEncryptionConverter.class)
    private List<MedicalTestItemLimits> limits;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = StringEncryptionConverter.class)
    private String flag;
}
