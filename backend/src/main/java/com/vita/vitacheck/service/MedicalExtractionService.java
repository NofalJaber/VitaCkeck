package com.vita.vitacheck.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.vita.vitacheck.dto.MedicalTestItemResponse;
import com.vita.vitacheck.model.MedicalTest;
import com.vita.vitacheck.model.MedicalTestItem;
import com.vita.vitacheck.repository.MedicalTestItemRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;
import java.nio.file.Path;

@Service
public class MedicalExtractionService {

    @Value("${gemini.api.key}")
    private String GEMINI_API_KEY;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final MedicalTestItemRepository medicalTestItemRepository;

    public MedicalExtractionService(RestTemplate restTemplate, ObjectMapper objectMapper,
            MedicalTestItemRepository medicalTestItemRepository) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.medicalTestItemRepository = medicalTestItemRepository;
    }

    private static final String SYSTEM_PROMPT = """
            Ești un sistem expert de extracție a datelor medicale.
            Analizează buletinul de analize medicale atașat (PDF) și extrage toate rezultatele.
            Returnează STRICT un obiect JSON cu următoarea structură, fără formatare Markdown suplimentară:
            {
              "laboratory": "Numele laboratorului (ex: Synevo, Medlife, Angelmed)",
              "collection_date": "YYYY-MM-DD",
              "rezults": [
                {
                  "test_name": "Numele analizei",
                  "numeric_value": valoarea ca numar (float) sau null daca e text,
                  "string_value": "valoarea ca text daca nu e numar (ex: negativ), altfel null",
                  "um": "unitatea de masura (ex: mg/dL), sau null",
                  "min_reference": numar (float) sau null,
                  "max_reference": numar (float) sau null,
                  "text_reference": "textul exact al intervalului de referinta (ex: [4-39] sau <0.9 negativ)",
                  "flag": "NORMAL", "HIGH" sau "LOW" (dedus din marcajele cu * sau bold)
                }
              ]
            }
            """;

    public String extractDataFromPdf(byte[] fileBytes) throws Exception {
        return callGeminiApi(fileBytes, SYSTEM_PROMPT);
    }

    private String callGeminiApi(byte[] fileBytes, String prompt) throws Exception {

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                + GEMINI_API_KEY;

        String base64File = Base64.getEncoder().encodeToString(fileBytes);

        ObjectNode requestBody = objectMapper.createObjectNode();
        ArrayNode contentsArray = requestBody.putArray("contents");
        ObjectNode partsObject = contentsArray.addObject();
        ArrayNode partsArray = partsObject.putArray("parts");

        ObjectNode textPart = partsArray.addObject();
        textPart.put("text", prompt);

        ObjectNode inlineDataPart = partsArray.addObject();
        ObjectNode inlineData = inlineDataPart.putObject("inlineData");
        inlineData.put("mimeType", "application/pdf");
        inlineData.put("data", base64File);

        ObjectNode generationConfig = requestBody.putObject("generationConfig");
        generationConfig.put("responseMimeType", "application/json");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> requestEntity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
        
        ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

        JsonNode rootNode = objectMapper.readTree(response.getBody());
        JsonNode textNode = rootNode
                .path("candidates").get(0)
                .path("content")
                .path("parts").get(0)
                .path("text");

        String extractedJson = textNode.asText();

        return extractedJson;
    }

    public MedicalTestItemResponse getTestData(MedicalTest test) {

        List<MedicalTestItem> items = medicalTestItemRepository.findByMedicalTest(test);

        MedicalTestItemResponse response = new MedicalTestItemResponse();
        response.setLaboratory(test.getLaboratoryName());

        if (test.getTestDate() != null)
            response.setCollection_date(test.getTestDate().toString());

        List<MedicalTestItemResponse.TestItemDto> dtoList = items.stream().map(item -> {
            MedicalTestItemResponse.TestItemDto dto = new MedicalTestItemResponse.TestItemDto();
            dto.setTest_name(item.getTestName());
            dto.setNumeric_value(item.getNumericValue());
            dto.setString_value(item.getStringValue());
            dto.setUm(item.getUnit());
            dto.setMin_reference(item.getMinReference());
            dto.setMax_reference(item.getMaxReference());
            dto.setText_reference(item.getTextReference());
            dto.setFlag(item.getFlag());
            return dto;
        }).collect(Collectors.toList());

        response.setRezults(dtoList);

        return response;
    }
}
