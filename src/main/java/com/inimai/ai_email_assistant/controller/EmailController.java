package com.inimai.ai_email_assistant.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.inimai.ai_email_assistant.dtos.EmailGenerateRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    @PostMapping("/generate")
    public String generate(
            @Valid @RequestBody EmailGenerateRequest request) {

        return "temporary";
    }
}