package com.vita.vitacheck.dto;

import lombok.Data;
import java.util.List;

import com.vita.vitacheck.model.MedicalTestItemLimits;

@Data
public class MedicalItemsProcessingResponse {
    private String test_name;
    private String um;
    private Double min_reference;
    private Double max_reference;
    private List<TestItemMeasurementDto> measurements;
    private List<MedicalTestItemLimits> limits;

    @Data
    public static class TestItemMeasurementDto {
        private String collection_date;
        private Double numeric_value;
        private Long medical_test_id;
        private String file_name;
    }
}
