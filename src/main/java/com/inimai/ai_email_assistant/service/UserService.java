package com.inimai.ai_email_assistant.service;

import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.inimai.ai_email_assistant.dtos.LoginRequest;
import com.inimai.ai_email_assistant.dtos.LoginResponse;
import com.inimai.ai_email_assistant.dtos.RegisterRequest;
import com.inimai.ai_email_assistant.dtos.RegisterResponse;
import com.inimai.ai_email_assistant.entity.User;
import com.inimai.ai_email_assistant.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userrepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userrepository, PasswordEncoder passwordEncoder) {
        this.userrepository = userrepository;
        this.passwordEncoder = passwordEncoder;
    }
    private static final Logger logger =
        LoggerFactory.getLogger(UserService.class);
    
    public RegisterResponse register(RegisterRequest request) {

    logger.info("Registration attempt for email: {}", request.getEmail());

    if (userrepository.findByEmail(request.getEmail()).isPresent()) {
        logger.warn("Registration failed: email already registered");
        throw new RuntimeException("Email already registered");
    }

    User user = new User();

    user.setUsername(request.getUsername());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setCreatedAt(LocalDateTime.now());

    User savedUser = userrepository.save(user);

    logger.info("User registered successfully with id: {}", savedUser.getId());

    RegisterResponse response = new RegisterResponse();

    response.setId(savedUser.getId());
    response.setUsername(savedUser.getUsername());
    response.setEmail(savedUser.getEmail());

    return response;
    }
    public LoginResponse login(LoginRequest request) {
        User user = userrepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        LoginResponse response = new LoginResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());

        return response;
    }
}