package com.workmatch.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizarUsuarioDTO(
        @NotBlank String nome,
        @NotBlank @Email String email,
        String telefone,
        String endereco,
        String cidade,
        @Size(max = 2) String estado
) {}