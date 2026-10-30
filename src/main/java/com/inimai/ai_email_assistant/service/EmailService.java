package com.inimai.ai_email_assistant.service;

import org.springframework.stereotype.Service;

import com.inimai.ai_email_assistant.dtos.EmailGenerateRequest;

@Service
public class EmailService {

    private final OpenRouterService openRouterService;

    public EmailService(OpenRouterService openRouterService) {
        this.openRouterService = openRouterService;
    }

    public String generateReply(EmailGenerateRequest request) {
        return openRouterService.generateReply(
                request.getEmailContent(),
                request.getInstruction());
    }
}
