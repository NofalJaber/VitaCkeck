package com.vita.vitacheck.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import javax.crypto.Cipher;
import java.util.Base64;

@Converter
public class StringEncryptionConverter implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES";

    @Override
    public String convertToDatabaseColumn(String data) {
        if (data == null || EncryptionConfig.secretKey == null) return null;
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, EncryptionConfig.secretKey);
            return Base64.getEncoder().encodeToString(cipher.doFinal(data.getBytes("UTF-8")));
        } catch (Exception e) {
            throw new RuntimeException("Eroare la criptarea textului", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || EncryptionConfig.secretKey == null) return null;
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, EncryptionConfig.secretKey);
            return new String(cipher.doFinal(Base64.getDecoder().decode(dbData)), "UTF-8");
        } catch (Exception e) {
            return dbData;
        }
    }
}