package com.inimai.ai_email_assistant.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    @Email(message = "Email should be valid")
    @NotBlank
    private String email;
    @NotBlank
    private String password;

    public LoginRequest() {

    }

}
