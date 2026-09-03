package com.workmatch.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private static final String GROQ_URL    = "https://api.groq.com/openai/v1/chat/completions";
    private static final String MODEL       = "openai/gpt-oss-120b";
    private static final double TEMPERATURE = 0.5;
    private static final int    MAX_TOKENS  = 512;

    private final AiProperties properties;
    private final ObjectMapper  mapper;

    public AiService(AiProperties properties, ObjectMapper mapper) {
        this.properties = properties;
        this.mapper     = mapper;
    }

    public String completar(List<Map<String, String>> messages) {
        try {
            Map<String, Object> body = Map.of(
                    "model",       MODEL,
                    "messages",    messages,
                    "temperature", TEMPERATURE,
                    "max_tokens",  MAX_TOKENS
            );

            byte[] payload = mapper.writeValueAsBytes(body);

            HttpURLConnection conn = (HttpURLConnection) URI.create(GROQ_URL).toURL().openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + properties.getKey());
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(10_000);
            conn.setReadTimeout(30_000);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(payload);
            }

            int status = conn.getResponseCode();
            var stream = status >= 400 ? conn.getErrorStream() : conn.getInputStream();
            Map<?, ?> resposta = mapper.readValue(stream, Map.class);

            if (status >= 400) {
                Object erro = ((Map<?, ?>) resposta.get("error")).get("message");
                throw new AiServiceException("Groq retornou erro " + status + ": " + erro);
            }

            List<?> choices = (List<?>) resposta.get("choices");
            Map<?, ?> choice  = (Map<?, ?>) choices.get(0);
            Map<?, ?> message = (Map<?, ?>) choice.get("message");
            return (String) message.get("content");

        } catch (AiServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new AiServiceException("Erro ao chamar API Groq: " + e.getMessage());
        }
    }
}