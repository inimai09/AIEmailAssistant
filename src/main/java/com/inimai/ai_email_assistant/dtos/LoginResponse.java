package com.inimai.ai_email_assistant.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {

    private Long id;
    private String username;
    private String email;

    public LoginResponse() {
        
    }
    
}
