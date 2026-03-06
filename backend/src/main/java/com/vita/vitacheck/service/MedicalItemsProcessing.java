package com.vita.vitacheck.service;

import com.vita.vitacheck.dto.MedicalItemsProcessingResponse;
import com.vita.vitacheck.model.MedicalTest;
import com.vita.vitacheck.model.MedicalTestItem;
import com.vita.vitacheck.model.MedicalTestItemLimits;
import com.vita.vitacheck.model.User;
import com.vita.vitacheck.repository.MedicalTestRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MedicalItemsProcessing {

    private final MedicalTestRepository medicalTestRepository;

    @Transactional
    public List<MedicalItemsProcessingResponse> processTestItems(User user) {
        List<MedicalTest> tests = medicalTestRepository.findByUserOrderByUploadDateDesc(user);
        Map<String, MedicalItemsProcessingResponse> groupedItems = new HashMap<>();

        for (MedicalTest test : tests) {
            String date = test.getTestDate() != null ? test.getTestDate() : test.getUploadDate().toString();

            for (MedicalTestItem item : test.getTestItems()) {
                if (item.getNumericValue() == null)
                    continue;

                String stdName = normalizeTestName(item.getTestName());
                String stdUnit = normalizeUnit(item.getUnit());
                Double stdValue = item.getNumericValue();

                Double currentMin = item.getMinReference();
                Double currentMax = item.getMaxReference();

                if(item.getMaxReference() == null && item.getMinReference() == null && item.getLimits() != null)
                {
                    for(MedicalTestItemLimits limit: item.getLimits())
                    {
                        if(limit.status().equals("NORMAL"))
                        {
                            currentMin = limit.lowerBound();
                            currentMax = limit.upperBound();
                            break;
                        }
                    }
                }
                final Double finalMin = currentMin != null ? currentMin : 0.0;
                final Double finalMax = currentMax;

                MedicalItemsProcessingResponse response = groupedItems.computeIfAbsent(stdName, key -> {
                    MedicalItemsProcessingResponse newResponse = new MedicalItemsProcessingResponse();
                    newResponse.setTest_name(stdName);
                    newResponse.setUm(stdUnit);
                    newResponse.setMin_reference(finalMin);
                    newResponse.setMax_reference(finalMax);
                    newResponse.setLimits(item.getLimits());

                    // AICI se inițializează lista despre care vorbeai
                    newResponse.setMeasurements(new ArrayList<>());
                    return newResponse;
                });

                // 3. Creăm punctul de pe grafic și îl adăugăm în lista analizei curente
                MedicalItemsProcessingResponse.TestItemNeasurementDto measurement = new MedicalItemsProcessingResponse.TestItemNeasurementDto();

                measurement.setCollection_date(date);
                measurement.setNumeric_value(stdValue);

                // Adăugăm în lista de istoric
                response.getMeasurements().add(measurement);
            }
        }

        List<MedicalItemsProcessingResponse> finalResult = new ArrayList<>(groupedItems.values());

        // 5. SORTARE MĂSURĂTORI: Sortăm lista de măsurători a fiecărei analize
        // cronologic (pentru grafic)
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        for (MedicalItemsProcessingResponse resp : finalResult) {
            resp.getMeasurements().sort((m1, m2) -> {
                try {
                    LocalDate d1 = LocalDate.parse(m1.getCollection_date(), fmt);
                    LocalDate d2 = LocalDate.parse(m2.getCollection_date(), fmt);
                    return d1.compareTo(d2); // crescător: vechi -> nou
                } catch (DateTimeParseException e) {
                    return 0; // fallback dacă data nu e validă
                }
            });
        }

        // 6. SORTARE ANALIZE: Sortăm analizele alfabetic după nume
        finalResult.sort(Comparator.comparing(MedicalItemsProcessingResponse::getTest_name));

        System.out.println("========== REZULTAT PROCESARE GRAFICE ==========");
        finalResult.forEach(res -> {
            System.out.println("Analiza: " + res.getTest_name() + " [" + res.getUm() + "]");
            System.out.println("  Referinte: " + res.getMin_reference() + " - " + res.getMax_reference());

            res.getMeasurements().forEach(m -> {
                System.out.println("    -> Data: " + m.getCollection_date() +
                        " | Valoare: " + m.getNumeric_value());
            });
            System.out.println("------------------------------------------------");
        });
        System.out.println("================================================");

        return finalResult;
    }

    private String normalizeTestName(String rawName) {
        if (rawName == null)
            return "Necunoscut";

        return rawName.trim();
    }

    private String normalizeUnit(String rawUnit) {
        if (rawUnit == null)
            return "";
        String cleanUnit = rawUnit.toLowerCase().replaceAll("\\s+", "");

        if (cleanUnit.equals("10^9/l") || cleanUnit.equals("10*3/ul") || cleanUnit.equals("10^3/ul")
                || cleanUnit.equals("mii/µl") || cleanUnit.equals("x10^3/ul"))
            return "mii/µL";
        if (cleanUnit.equals("10^12/l") || cleanUnit.equals("10*6/ul") || cleanUnit.equals("mil/µl"))
            return "mil/µL";
        if (cleanUnit.equals("g/l"))
            return "g/dL";

        return rawUnit;
    }
}