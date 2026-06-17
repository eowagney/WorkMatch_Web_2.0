package com.workmatch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ServicoDTO(

        @NotBlank(message = "Título obrigatório")
        @Size(max = 150)
        String titulo,

        @NotBlank(message = "Especialidade obrigatória")
        @Size(max = 100)
        String especialidade,

        @NotBlank(message = "Descrição obrigatória")
        @Size(max = 100)
        String descricao,

        @NotBlank(message = "Cidade obrigatório")
        @Size(max = 100)
        String cidade,

        @NotBlank(message = "Estado obrigatório")
        @Size(max = 100)
        String estado,

        @NotNull(message = "ID do cliente obrigatório")
        UUID clienteId
) {}