package com.inimai.ai_email_assistant.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.inimai.ai_email_assistant.dtos.LoginRequest;
import com.inimai.ai_email_assistant.dtos.LoginResponse;
import com.inimai.ai_email_assistant.dtos.RegisterRequest;
import com.inimai.ai_email_assistant.dtos.RegisterResponse;
import com.inimai.ai_email_assistant.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public RegisterResponse postRegister(
            @Valid @RequestBody RegisterRequest request) {

        return userService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request) {

        return userService.login(request);
    }
}
