package com.vita.vitacheck.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vita.vitacheck.model.MedicalTestItemLimits;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import javax.crypto.Cipher;
import java.util.Base64;
import java.util.List;

@Converter
public class LimitsEncryptionConverter implements AttributeConverter<List<MedicalTestItemLimits>, String> {

    private static final String ALGORITHM = "AES";
    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<MedicalTestItemLimits> data) {
        if (data == null || EncryptionConfig.secretKey == null) return null;
        try {
            String json = mapper.writeValueAsString(data);
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, EncryptionConfig.secretKey);
            return Base64.getEncoder().encodeToString(cipher.doFinal(json.getBytes("UTF-8")));
        } catch (Exception e) {
            throw new RuntimeException("Eroare la criptarea limitelor JSON", e);
        }
    }

    @Override
    public List<MedicalTestItemLimits> convertToEntityAttribute(String dbData) {
        if (dbData == null || EncryptionConfig.secretKey == null) return null;
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, EncryptionConfig.secretKey);
            String json = new String(cipher.doFinal(Base64.getDecoder().decode(dbData)), "UTF-8");
            
            return mapper.readValue(json, new TypeReference<List<MedicalTestItemLimits>>() {});
        } catch (Exception e) {
            try {
                return mapper.readValue(dbData, new TypeReference<List<MedicalTestItemLimits>>() {});
            } catch (Exception ex) {
                return null;
            }
        }
    }
}