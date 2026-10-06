package com.workmatch.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.workmatch.model.PlanosProperties;
import com.workmatch.service.PlanoService;
import com.workmatch.service.ProfissionalService;

@RestController
@RequestMapping("/api/planos")
public class PlanoController {

    private final PlanoService planoService;
    private final ProfissionalService profissionalService;
    private final PlanosProperties props;

    public PlanoController(
            PlanoService planoService,
            ProfissionalService profissionalService,
            PlanosProperties props) {

        this.planoService = planoService;
        this.profissionalService = profissionalService;
        this.props = props;
    }

    @GetMapping("/config")
    public Map<String, Object> config() {
        return Map.of(
                "ativo", props.isAtivo(),
                "limiteBasicoMensal", props.getLimiteBasicoMensal()
        );
    }

    @GetMapping("/profissional/{id}")
    public Map<String, Object> status(@PathVariable UUID id) {

        var profissional = profissionalService.buscarPorId(id);

        return planoService.status(profissional);
    }
}