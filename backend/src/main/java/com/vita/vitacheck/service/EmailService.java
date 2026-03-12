package com.vita.vitacheck.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = "http://localhost:3000/reset-password?token=" + token;
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("VitaCheck - Password Reset Request");
        message.setText("To reset your password, please click the link below:\n\n" 
                + resetUrl + "\n\nThis link will expire in 1 hour.");
        
        mailSender.send(message);
    }
}