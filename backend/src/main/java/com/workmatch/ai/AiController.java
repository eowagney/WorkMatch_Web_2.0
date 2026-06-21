package com.workmatch.ai;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService service;

    public AiController(AiService service) {
        this.service = service;
    }

    @PostMapping("/completions")
    public ResponseEntity<Map<String, String>> completar(@RequestBody AiRequest request) {
        String conteudo = service.completar(request.messages());
        return ResponseEntity.ok(Map.of("content", conteudo));
    }
}
