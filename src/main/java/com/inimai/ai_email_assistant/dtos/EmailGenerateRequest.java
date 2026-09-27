package com.inimai.ai_email_assistant.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter 
public class EmailGenerateRequest {
    @NotBlank 
    private String emailContent;
    @NotBlank 
    private String instruction;
}
