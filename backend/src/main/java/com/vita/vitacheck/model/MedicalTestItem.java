package com.vita.vitacheck.model;

import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.vita.vitacheck.config.StringEncryptionConverter;

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

    @Convert(converter = StringEncryptionConverter.class)
    private String testName;
    private Double numericValue;

    @Convert(converter = StringEncryptionConverter.class)
    private String stringValue;

    @Convert(converter = StringEncryptionConverter.class)
    private String unit;

    private Double minReference;
    private Double maxReference;

    @Convert(converter = StringEncryptionConverter.class)
    private String textReference;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<MedicalTestItemLimits> limits;

    @Convert(converter = StringEncryptionConverter.class)
    private String flag;
}
