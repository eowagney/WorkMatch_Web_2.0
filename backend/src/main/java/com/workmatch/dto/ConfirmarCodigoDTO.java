package com.workmatch.dto;

import jakarta.validation.constraints.NotBlank;

public record ConfirmarCodigoDTO(
        @NotBlank(message = "Informe o código.")
        String codigo
) {
}