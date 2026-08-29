package com.inimai.ai_email_assistant.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.inimai.ai_email_assistant.dtos.RegisterRequest;
import com.inimai.ai_email_assistant.dtos.RegisterResponse;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/register")
    public  RegisterResponse postRegister(@Valid @RequestBody RegisterRequest request) {
        return new RegisterResponse();
    }
    
}
