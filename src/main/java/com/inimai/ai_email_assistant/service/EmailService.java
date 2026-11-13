package com.inimai.ai_email_assistant.service;

import org.springframework.stereotype.Service;
import com.inimai.ai_email_assistant.dtos.EmailGenerateRequest;

@Service
public class EmailService {

    private final GroqService groqService;

    public EmailService(GroqService groqService) {
        this.groqService = groqService;
    }

    public String generateReply(EmailGenerateRequest request) {
        return groqService.generateReply(
                request.getEmailContent(),
                request.getInstruction());
    }
}