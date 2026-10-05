package com.workmatch.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizarProfissionalDTO(
        @NotBlank String nome,
        @NotBlank @Email String email,
        @NotBlank String telefone,       // a coluna é nullable = false
        String endereco,
        String cidade,
        @Size(max = 2) String estado,
        @NotBlank String especialidade,
        String descricao,
        @Min(0) Integer experienciaAnos
) {}