package com.inimai.ai_email_assistant.service;

import org.springframework.stereotype.Service;

import com.inimai.ai_email_assistant.dtos.EmailGenerateRequest;

@Service
public class EmailService {

    public String generateReply(EmailGenerateRequest request) {

        String emailContent = request.getEmailContent();
        String instruction = request.getInstruction();
        //not yet used ai package com.inimai.ai_email_assistant.service;
         return "Email: " + emailContent + "\nInstruction: " + instruction;

    
    }
}