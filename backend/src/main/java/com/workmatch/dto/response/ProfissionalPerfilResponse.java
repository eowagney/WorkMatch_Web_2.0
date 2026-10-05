package com.workmatch.dto.response;

import java.util.UUID;

public record ProfissionalPerfilResponse(
        UUID id, String nome, String email, String telefone,
        String endereco, String cidade, String estado,
        String especialidade, String descricao, Integer experienciaAnos
) {}
