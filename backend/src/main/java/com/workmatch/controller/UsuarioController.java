package com.workmatch.controller;

import com.workmatch.dto.UsuarioDTO;
import com.workmatch.model.Usuario;
import com.workmatch.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody @Valid UsuarioDTO dto) {
        dto.setRole("CLIENTE");
        Usuario usuario = (Usuario) service.cadastrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", "Usuário cadastrado com sucesso",
                "usuario", Map.of("nome", usuario.getNome())
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}