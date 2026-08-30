package com.inimai.ai_email_assistant.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class GlobalException {
    @ExceptionHandler(EmailAlreadyExistException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> handleEmailAlreadyExists(
        EmailAlreadyExistException ex){
            return Map.of(
                 "message", ex.getMessage()
           );
    }
}
