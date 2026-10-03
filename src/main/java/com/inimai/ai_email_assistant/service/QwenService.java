package com.inimai.ai_email_assistant.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class QwenService {

    private final RestClient restClient;
    private final String apiKey;
    private final String model;

    public QwenService(
            @Value("${qwen.api-key}") String apiKey,
            @Value("${qwen.base-url}") String baseUrl,
            @Value("${qwen.model}") String model) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
        this.apiKey = apiKey;
        this.model = model;
    }

    public String generateReply(String emailContent, String instruction) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "DASHSCOPE_API_KEY environment variable is not set");
        }

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content",
                                "You are an email assistant. Write a complete email reply. "
                                        + "Follow the user's instruction for tone and content. "
                                        + "Return only the reply text, with no extra commentary."),
                        Map.of(
                                "role", "user",
                                "content",
                                "Original email:\n" + emailContent
                                        + "\n\nInstruction:\n" + instruction)));

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
            throw new IllegalStateException("Qwen API returned no reply content");
        }

        return response.choices().get(0).message().content();
    }

    private record ChatCompletionResponse(List<Choice> choices) {
        private record Choice(Message message) {
        }

        private record Message(String content) {
        }
    }
}
