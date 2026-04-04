package com.vita.vitacheck.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import javax.crypto.Cipher;

public class ByteArrayEncryptionConverter implements AttributeConverter<byte[], byte[]>{

    private static final String ALGORITHM = "AES";

    @Override
    public byte[] convertToDatabaseColumn(byte[] data){
        if (data == null || EncryptionConfig.secretKey == null) return null;
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, EncryptionConfig.secretKey);
            return cipher.doFinal(data);
        } catch (Exception e) {
            throw new RuntimeException("Eroare la criptarea fisierului PDF", e);
        }
    }

    @Override
    public byte[] convertToEntityAttribute(byte[] dbData){
        if (dbData == null || EncryptionConfig.secretKey == null) return null;
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, EncryptionConfig.secretKey);
            return cipher.doFinal(dbData);
        } catch (Exception e) {
            return dbData;
        }
    }
}
