package com.vita.vitacheck.repository;

import com.vita.vitacheck.model.MedicalTest;
import com.vita.vitacheck.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicalTestRepository extends JpaRepository<MedicalTest, Long> {
    List<MedicalTest> findByUserOrderByUploadDateDesc(User user);
}