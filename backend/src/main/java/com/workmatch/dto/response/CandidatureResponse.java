package com.workmatch.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record CandidatureResponse(
    UUID id,
    UUID servicoId,
    UUID profissionalId,
    String nome,
    String especialidade,
    String cidade,
    String estado,
    LocalDateTime criadoEm,
    BigDecimal avaliacaoMedia,
    Integer totalAvaliacoes,
    Integer experienciaAnos
) {}