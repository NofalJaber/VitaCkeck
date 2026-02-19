package com.vita.vitacheck.controller;

import com.vita.vitacheck.dto.MedicalTestItemResponse;
import com.vita.vitacheck.dto.MedicalTestResponse;
import com.vita.vitacheck.model.MedicalTest;
import com.vita.vitacheck.model.User;
import com.vita.vitacheck.service.MedicalExtractionService;
import com.vita.vitacheck.service.MedicalTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class MedicalTestController {

    private final MedicalTestService medicalTestService;
    private final MedicalExtractionService medicalExtractionService;


    // Upload a new test
    @PostMapping("/upload")
    public ResponseEntity<MedicalTestResponse> uploadTest(@AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {
        try {
            MedicalTestResponse response = medicalTestService.storeTest(file, user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get list of all tests for the user
    @GetMapping
    public ResponseEntity<List<MedicalTestResponse>> getUserTests(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(medicalTestService.getUserTests(user));
    }

    // Download/View a specific test
    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadTest(@AuthenticationPrincipal User user, @PathVariable Long id) {
        MedicalTest test = medicalTestService.getTestFile(id, user);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + test.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(test.getFileType()))
                .body(test.getData());
    }

    // Rename a specific test
    @PutMapping("/{id}/rename")
    public ResponseEntity<String> renameTest(@AuthenticationPrincipal User user, @PathVariable Long id,
            @RequestParam String newName) {
        try {
            medicalTestService.updateTestFileName(id, newName, user);
            return ResponseEntity.ok("File name updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }

    // Delete a specific test
    @DeleteMapping("/{id}/delete")
    public ResponseEntity<String> deleteTest(@AuthenticationPrincipal User user, @PathVariable Long id)
    {
        try{
            medicalTestService.deleteTestFile(id, user);
            return ResponseEntity.ok("File deleted successfully");
        }
        catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Analyze test
    @PostMapping("/{id}/analyze")
    public ResponseEntity<String> analyzeTest(@AuthenticationPrincipal User user, @PathVariable Long id)
    {
        try{
            MedicalTest test = medicalTestService.getTestFile(id, user);
            byte[] fileBytes = test.getData();

            medicalTestService.analyzeTest(test, fileBytes);
            return ResponseEntity.ok("Test analyzed successfully");
        }
        catch (RuntimeException e)
        {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/test-data")
    public ResponseEntity<MedicalTestItemResponse> getAnalyzedData(@AuthenticationPrincipal User user, @PathVariable Long id)
    {
        try
        {
            MedicalTest test = medicalTestService.getTestFile(id, user);
            return ResponseEntity.ok(medicalExtractionService.getTestData(test));
        }
        catch (Exception e)
        {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}