package com.workmatch.dto.response;

import com.workmatch.model.StatusServico;

import java.time.LocalDateTime;
import java.util.UUID;

public record ServicoResponse(
        UUID          id,
        String        titulo,
        String        especialidade,
        String        descricao,
        String        cidade,
        String        estado,
        StatusServico status,
        UUID          clienteId,
        String        clienteNome,
        UUID          profissionalId,
        String        profissionalNome,
        LocalDateTime dataCriacao,
        LocalDateTime dataAtualizacao
) {}