package com.vita.vitacheck.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.vita.vitacheck.config.StringEncryptionConverter;
import com.vita.vitacheck.config.ByteArrayEncryptionConverter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @Convert(converter = StringEncryptionConverter.class)
    private String fileName;

    private String fileType;
    private LocalDateTime uploadDate;

    @Column(columnDefinition = "bytea")
    @Lob
    @Convert(converter = ByteArrayEncryptionConverter.class)
    private byte[] data;

    private String laboratoryName;
    private String testDate;

    @Builder.Default
    @OneToMany(mappedBy = "medicalTest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MedicalTestItem> testItems = new ArrayList<>();

    public void addTestItem(MedicalTestItem item) {
        testItems.add(item);
        item.setMedicalTest(this);
    }

    public void removeTestItem(MedicalTestItem item) {
        testItems.remove(item);
        item.setMedicalTest(null);
    }
}