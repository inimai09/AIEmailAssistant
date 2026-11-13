package com.inimai.ai_email_assistant.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

@Service
public class GroqService {

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public GroqService(
            @Value("${groq.api-key}") String apiKey,
            @Value("${groq.base-url}") String baseUrl,
            @Value("${groq.model}") String model) {

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();

        this.apiKey = apiKey;
        this.model = model;
    }

    public String generateReply(String emailContent, String instruction) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "GROQ_API_KEY environment variable is not set");
        }

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content",
                                "You are an email writing assistant. Follow the user's instruction carefully. "
                                        + "Return only the requested text, with no extra commentary or labels."),
                        Map.of(
                                "role", "user",
                                "content",
                                "Content:\n" + emailContent
                                        + "\n\nInstruction:\n" + instruction)));

        try {

            ChatCompletionResponse response = restClient.post()
                    .uri("/chat/completions")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(ChatCompletionResponse.class);

            if (response == null
                    || response.choices() == null
                    || response.choices().isEmpty()
                    || response.choices().get(0).message() == null
                    || response.choices().get(0).message().content() == null
                    || response.choices().get(0).message().content().isBlank()) {

                throw new IllegalStateException(
                        "Groq API returned no reply content");
            }

            return response.choices().get(0).message().content();

        } catch (RestClientResponseException e) {

            throw new IllegalStateException(
                    "Groq API error: HTTP " + e.getStatusCode().value(), e);

        } catch (RestClientException e) {

            throw new IllegalStateException(
                    "Failed to call Groq API", e);
        }
    }

    private record ChatCompletionResponse(List<Choice> choices) {

        private record Choice(Message message) {
        }

        private record Message(String content) {
        }
    }
}