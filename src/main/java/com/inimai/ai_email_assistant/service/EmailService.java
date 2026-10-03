package com.inimai.ai_email_assistant.service;

import org.springframework.stereotype.Service;

import com.inimai.ai_email_assistant.dtos.EmailGenerateRequest;

@Service
public class EmailService {

    private final QwenService qwenService;

    public EmailService(QwenService qwenService) {
        this.qwenService = qwenService;
    }

    public String generateReply(EmailGenerateRequest request) {
        return qwenService.generateReply(
                request.getEmailContent(),
                request.getInstruction());
    }
}
