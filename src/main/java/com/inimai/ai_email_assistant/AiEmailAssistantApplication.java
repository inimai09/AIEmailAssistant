package com.inimai.ai_email_assistant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class AiEmailAssistantApplication {

    public static void main(String[] args) {

        Dotenv.configure()
                .directory("./")
                .ignoreIfMissing()
                .systemProperties()
                .load();

        SpringApplication.run(AiEmailAssistantApplication.class, args);
    }
}
