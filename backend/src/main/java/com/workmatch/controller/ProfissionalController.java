package com.workmatch.controller;

import com.workmatch.dto.UsuarioDTO;
import com.workmatch.dto.response.ProfissionalResponse;
import com.workmatch.model.Profissional;
import com.workmatch.service.ProfissionalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profissionais")
public class ProfissionalController {

    private final ProfissionalService profissionalService;

    public ProfissionalController(ProfissionalService profissionalService) {
        this.profissionalService = profissionalService;
    }

    // B09 — agora usa ProfissionalService (não UsuarioService)
    // B03 — sem cast; ProfissionalService.cadastrar() já retorna Profissional diretamente
    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody @Valid UsuarioDTO dto) {
        dto.setRole("PROFISSIONAL");
        Profissional p = profissionalService.cadastrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", "Profissional cadastrado com sucesso",
                "usuario", Map.of("nome", p.getNome())
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfissionalResponse> buscarPorId(@PathVariable UUID id) {
        Profissional p = profissionalService.buscarPorId(id);
        return ResponseEntity.ok(new ProfissionalResponse(
                p.getId(),
                p.getNome(),
                p.getEspecialidade(),
                p.getDescricao(),
                p.getExperienciaAnos(),
                p.getAvaliacaoMedia(),
                p.getTotalAvaliacoes(),
                p.getCidade(),
                p.getEstado(),
                p.getAtivo()
        ));
    }
}