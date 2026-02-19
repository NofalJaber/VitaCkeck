package com.vita.vitacheck.repository;

import com.vita.vitacheck.model.MedicalTest;
import com.vita.vitacheck.model.MedicalTestItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicalTestItemRepository extends JpaRepository<MedicalTestItem, Long> {
    List<MedicalTestItem> findByMedicalTest(MedicalTest medicalTest);
}
