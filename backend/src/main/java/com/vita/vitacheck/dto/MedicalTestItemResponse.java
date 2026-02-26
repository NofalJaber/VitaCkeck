package com.vita.vitacheck.dto;

import lombok.Data;
import java.util.List;

import com.vita.vitacheck.model.MedicalTestItemLimits;

@Data
public class MedicalTestItemResponse {
    private String laboratory;
    private String collection_date;
    private List<TestItemDto> rezults;

    @Data
    public static class TestItemDto {
        private String test_name;
        private Double numeric_value;
        private String string_value;
        private String um;
        private Double min_reference;
        private Double max_reference;
        private String text_reference;
        private String flag;
        private List<MedicalTestItemLimits> limits;
    }
}
