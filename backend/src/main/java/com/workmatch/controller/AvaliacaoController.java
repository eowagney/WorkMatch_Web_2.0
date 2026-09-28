package com.workmatch.controller;

import com.workmatch.dto.AvaliacaoDTO;
import com.workmatch.dto.response.AvaliacaoResponse;
import com.workmatch.service.AvaliacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {

    private final AvaliacaoService service;

    public AvaliacaoController(AvaliacaoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AvaliacaoResponse> avaliar(@RequestBody @Valid AvaliacaoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.avaliar(dto));
    }

    @GetMapping("/profissional/{profissionalId}")
    public ResponseEntity<List<AvaliacaoResponse>> listarPorProfissional(
            @PathVariable UUID profissionalId) {
        return ResponseEntity.ok(service.listarPorProfissional(profissionalId));
    }

    // Retorna as avaliações completas (com nota) feitas por este cliente
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<AvaliacaoResponse>> listarPorCliente(
            @PathVariable UUID clienteId) {
        return ResponseEntity.ok(service.listarPorCliente(clienteId));
    }

    // Retorna lista de servicoIds já avaliados por este cliente
    @GetMapping("/cliente/{clienteId}/avaliados")
    public ResponseEntity<List<UUID>> servicosAvaliados(@PathVariable UUID clienteId) {
        return ResponseEntity.ok(service.servicosAvaliadosPorCliente(clienteId));
    }
}