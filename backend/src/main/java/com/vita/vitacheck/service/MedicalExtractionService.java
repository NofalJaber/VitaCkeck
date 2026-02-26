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
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.nio.file.Path;

@Service
public class MedicalExtractionService {

    @Value("${gemini.api.keys}")
    private List<String> apiKeys;

    private final List<String> models = Arrays.asList("gemini-2.5-flash","gemini-3-flash-preview");
    private final AtomicInteger currentComboIndex = new AtomicInteger(0);

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
            Atenție: Dacă intervalul de referință conține mai categorii (ex: Normal, La limita, Crescut), corelează valoarea pacientului cu categoria potrivită.
            
            IMPORTANT: Returnează STRICT un singur OBIECT JSON ca rădăcină (trebuie să înceapă cu '{' și să se termine cu '}'). NU returna un Array ('['). 
            Dacă vrei să returnezi o listă de rezultate, pune-o obligatoriu în interiorul câmpului "rezults".
            Fără formatare Markdown suplimentară.
            
            Structura trebuie să fie exact aceasta:
            {
              "laboratory": "Numele laboratorului (ex: Synevo, Medlife, Angelmed)",
              "collection_date": "YYYY-MM-DD",
              "rezults": [
                {
                  "test_name": "Numele analizei, doar numele principal fara diacritice, prescurtari sau detalii in paranteze () si fara unitati de masura (EX: %)",
                  "numeric_value": valoarea ca numar (float) sau null daca e text,
                  "string_value": "valoarea ca text daca nu e numar (ex: negativ), altfel null",
                  "um": "unitatea de masura (ex: mg/dL), sau null",
                  "min_reference": numar (float) sau null,
                  "max_reference": numar (float) sau null,
                  "text_reference": "textul exact al intervalului de referinta, DAR ELIMINĂ complet orice explicații sau recomandări aflate în paranteze rotunde (ex: ignoră '(SE RECOMANDA RETESTARE...)')",
                  "flag": "Eticheta rezultatului. Dacă referința are categorii de text (ex: 'Normal: <150', 'La limita: 150-199', 'Crescut: >200'), compară numeric_value cu ele și returnează categoria exactă (ex: 'La limita', 'Crescut'). Dacă nu există astfel de categorii în text, folosește 'Normal', 'Crescut' sau 'Deficit' dedus din marcajele cu * sau bold din document.",
                  "limits": "Dacă referința are mai multe categorii textuale (ex: 'Normal: <150', 'La limita: 150-199', 'Crescut: >200'), extrage o listă de OBIECTE JSON. Exemplu: [ { \"lowerBound\": (float sau null pt '<'), \"upperBound\": (float sau null pt '>'), \"label\": \"(text exact)\", \"status\": \"(vezi reguli)\" } ]. REGULI PENTRU STATUS (alege STRICT una): 'NORMAL' (pentru 'Normal', 'Acceptabil', 'Optim', 'Negativ'); 'HIGH' (pentru ORICE prag aflat valoric peste normal, incluzând 'La limita' în sens crescător, 'Crescut', 'Foarte crescut'); 'LOW' (pentru ORICE prag aflat sub normal, incluzând 'La limita' în sens descrescător, ex: 'Scazut', 'Deficit'); 'INCONCLUSIVE'. ATENȚIE: Pentru referințe atipice de forma 'Negativ: <0.9; Neconcludent: 0.9 - 1.1; Pozitiv: >1.1', unde nu există un prag explicit denumit 'Normal', analizează fiecare segment independent. Este complet permis ca mai multe praguri diferite (ex: atât <0.9 cât și >1.1) să primească simultan statusul 'NORMAL' dacă reprezintă rezultate clinice definitive/valide, rezervând 'INCONCLUSIVE' exclusiv pentru zonele de incertitudine. Dacă nu există o astfel de scară, returnează null."
                }
              ]
            }
            """;

    public String extractDataFromPdf(byte[] fileBytes) throws Exception {
        return callGeminiApi(fileBytes, SYSTEM_PROMPT);
    }

    private String callGeminiApi(byte[] fileBytes, String prompt) throws Exception {

        if (apiKeys == null || apiKeys.isEmpty()) {
            throw new RuntimeException("Nu a fost configurată nicio cheie API Gemini.");
        }

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

        int totalCombinations = apiKeys.size() * models.size();
        ResponseEntity<String> response = null;

        outer: for (String model : models) {

            for (String key : apiKeys) {
                String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model
                        + ":generateContent?key=" + key;

                try {
                    System.out.println("Calling API with model [" + model + "] and key #" + apiKeys.indexOf(key));
                    response = restTemplate.postForEntity(url, requestEntity, String.class);
                    break outer;

                } catch (HttpClientErrorException e) {
                    if (e.getStatusCode().value() == 429) 
                    {
                        System.out.println("Rate limit exceeded for model[" + model + "] and key #" + apiKeys.indexOf(key));
                        currentComboIndex.incrementAndGet();
                    } 
                    else if (e.getStatusCode().value() == 404) 
                    {
                        System.out.println("Model [" + model + "] not found (404)");
                        currentComboIndex.incrementAndGet();
                    } 
                    else 
                    {
                        throw e;
                    }
                }
            }

        }

        if (response == null) {
            throw new RuntimeException("❌ Toate cele " + totalCombinations
                    + " combinații (chei + modele) și-au consumat cota sau au dat eroare.");
        }

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
            dto.setLimits(item.getLimits());
            return dto;
        }).collect(Collectors.toList());

        response.setRezults(dtoList);

        return response;
    }
}
