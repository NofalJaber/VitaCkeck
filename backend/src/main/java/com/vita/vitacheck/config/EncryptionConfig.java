package com.vita.vitacheck.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import javax.crypto.spec.SecretKeySpec;
import jakarta.annotation.PostConstruct;

@Configuration
public class EncryptionConfig {

    public static SecretKeySpec secretKey;

    @Value("${app.encryption.key}")
    private String hexKey;

    @PostConstruct
    public void init() {
        if (hexKey == null || hexKey.trim().isEmpty()) {
            System.out.println("⚠️ ATENTIE: Cheia AES lipseste din environment!");
            return;
        }
        
        try {
            byte[] keyBytes = new byte[hexKey.length() / 2];
            for (int i = 0; i < keyBytes.length; i++) {
                int index = i * 2;
                int j = Integer.parseInt(hexKey.substring(index, index + 2), 16);
                keyBytes[i] = (byte) j;
            }
            
            secretKey = new SecretKeySpec(keyBytes, "AES");
            System.out.println("✅ Cheia AES-256 HEX a fost incarcata si validata cu succes prin @Value!");
            
        } catch (Exception e) {
            throw new RuntimeException("Eroare fatala: Cheia oferita nu este un Hexadecimal valid pentru AES", e);
        }
    }
}