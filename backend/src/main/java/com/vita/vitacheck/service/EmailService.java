package com.vita.vitacheck.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final RestTemplate restTemplate;

    @Value("${resend.api.key}")
    private String apiKey;

    @Value("${resend.sender.email}")
    private String senderEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        
        String url = "https://api.resend.com/emails";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("from", "VitaCheck Security <" + senderEmail + ">");
        body.put("to", List.of(to));
        body.put("subject", "VitaCheck - Password Reset Request");
        
        String htmlContent = "<div style=\"font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 8px;\">"
                + "<h2 style=\"color: #23436a;\">Password Reset</h2>"
                + "<p>You requested a password reset for your VitaCheck account.</p>"
                + "<p>Click the button below to set a new password:</p>"
                + "<a href=\"" + resetUrl + "\" style=\"display: inline-block; padding: 12px 24px; background-color: #4896bb; color: white; font-weight: bold; text-decoration: none; border-radius: 6px; margin: 15px 0;\">Reset Password</a>"
                + "<p style=\"font-size: 12px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px;\">If you did not request this, please ignore this email. The link expires in 1 hour.</p>"
                + "</div>";

        body.put("html", htmlContent);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, request, String.class);
            System.out.println("Email sent successfully via Resend API to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email via Resend API: " + e.getMessage());
        }
    }
}