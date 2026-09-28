package com.workmatch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlterarSenhaDTO(
        @NotBlank String senhaAtual,

        @NotBlank
        @Size(min = 6, message = "A nova senha deve ter pelo menos 6 caracteres")
        String novaSenha
) {}