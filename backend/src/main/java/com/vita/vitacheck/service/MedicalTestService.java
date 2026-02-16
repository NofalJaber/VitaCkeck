package com.vita.vitacheck.service;

import com.vita.vitacheck.dto.MedicalTestResponse;
import com.vita.vitacheck.model.MedicalTest;
import com.vita.vitacheck.model.User;
import com.vita.vitacheck.repository.MedicalTestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalTestService {

    private final MedicalTestRepository medicalTestRepository;

    public MedicalTestResponse storeTest(MultipartFile file, User user) throws IOException {

        MedicalTest test = MedicalTest.builder()
                .user(user)
                .fileName(file.getOriginalFilename())
                .fileType(file.getContentType())
                .uploadDate(LocalDateTime.now())
                .data(file.getBytes())
                .build();

        MedicalTest savedTest = medicalTestRepository.save(test);

        return MedicalTestResponse.builder()
                .id(savedTest.getId())
                .fileName(savedTest.getFileName())
                .fileType(savedTest.getFileType())
                .uploadDate(savedTest.getUploadDate())
                .build();
    }

    public List<MedicalTestResponse> getUserTests(User user) {

        return medicalTestRepository.findByUserOrderByUploadDateDesc(user)
                .stream()
                .map(test -> MedicalTestResponse.builder()
                        .id(test.getId())
                        .fileName(test.getFileName())
                        .fileType(test.getFileType())
                        .uploadDate(test.getUploadDate())
                        .build())
                .collect(Collectors.toList());
    }

    public MedicalTest getTestFile(Long id, User user) {
        MedicalTest test = medicalTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        checkFileOwnership(test, user);

        return test;
    }

    public void updateTestFileName(Long id, String newName, User user) {
        MedicalTest test = medicalTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found"));

        checkFileOwnership(test, user);

        test.setFileName(newName);
        medicalTestRepository.save(test);
    }

    public void deleteTestFile(Long id, User user) {
        MedicalTest test = medicalTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Test not found"));
        checkFileOwnership(test, user);

        medicalTestRepository.delete(test);

    }

    private void checkFileOwnership(MedicalTest test, User user) {
        // Security check: ensure the file belongs to the requesting user
        if (!test.getUser().getEmail().equals(user.getEmail())) {
            throw new RuntimeException("Unauthorized access to file");
        }
    }
}