package com.vita.vitacheck.model;

import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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

    private String testName;
    private Double numericValue;
    private String stringValue;
    private String unit;

    private Double minReference;
    private Double maxReference;
    private String textReference;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<MedicalTestItemLimits> limits;

    private String flag;
}
