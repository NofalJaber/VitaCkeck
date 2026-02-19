package com.vita.vitacheck.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vita.vitacheck.dto.MedicalTestItemResponse;
import com.vita.vitacheck.dto.MedicalTestResponse;
import com.vita.vitacheck.model.MedicalTest;
import com.vita.vitacheck.model.MedicalTestItem;
import com.vita.vitacheck.model.User;
import com.vita.vitacheck.repository.MedicalTestRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalTestService {

    private final MedicalTestRepository medicalTestRepository;

    private final MedicalExtractionService medicalExtractionService;
    private final ObjectMapper objectMapper;

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

    @Transactional
    public void analyzeTest(MedicalTest test, byte[] fileBytes)
    {
        try {
            System.out.println("Începem procesarea AI pentru fișierul: " + test.getFileName());

            // Extragem JSON-ul ca text
            String jsonFromGemini = medicalExtractionService.extractDataFromPdf(fileBytes);

            // Parsăm JSON-ul string în obiectul nostru DTO
            MedicalTestItemResponse extractedData = objectMapper.readValue(jsonFromGemini,
                    MedicalTestItemResponse.class);

            System.out.println("Laborator găsit: " + extractedData.getLaboratory());

            // Setăm informațiile generale pe document
            test.setLaboratoryName(extractedData.getLaboratory());
            String dateTime = extractedData.getCollection_date();
            test.setTestDate(dateTime);

            // 3. Parcurgem rezultatele și creăm entitățile copil
            if (extractedData.getRezults() != null) {
                for (MedicalTestItemResponse.TestItemDto dto : extractedData.getRezults()) {

                    MedicalTestItem item = new MedicalTestItem();
                    item.setTestName(dto.getTest_name());
                    item.setNumericValue(dto.getNumeric_value());
                    item.setStringValue(dto.getString_value());
                    item.setUnit(dto.getUm());
                    item.setMinReference(dto.getMin_reference());
                    item.setMaxReference(dto.getMax_reference());
                    item.setTextReference(dto.getText_reference());
                    item.setFlag(dto.getFlag());

                    test.addTestItem(item);
                }
            }
            System.out.println("S-au extras cu succes " + test.getTestItems().size() + " analize.");

            medicalTestRepository.save(test);

        } catch (Exception e) {
            System.err.println("Eroare la extragerea automată a datelor cu AI: " + e.getMessage());
        }
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