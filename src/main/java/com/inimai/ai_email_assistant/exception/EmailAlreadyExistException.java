package com.inimai.ai_email_assistant.exception;

public class EmailAlreadyExistException extends RuntimeException {

    public EmailAlreadyExistException(String message) {
        super(message);
    }
}