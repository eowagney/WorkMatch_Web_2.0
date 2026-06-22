package com.workmatch.service;

import com.workmatch.dto.response.ServicoResponse;
import com.workmatch.model.Servico;
import org.springframework.stereotype.Component;

@Component
public class MapperService {

    public ServicoResponse toResponse(Servico s) {
        return new ServicoResponse(
                s.getId(),
                s.getTitulo(),
                s.getEspecialidade(),
                s.getDescricao(),
                s.getCidade(),
                s.getEstado(),
                s.getStatus(),
                s.getCliente()      != null ? s.getCliente().getId()       : null,
                s.getCliente()      != null ? s.getCliente().getNome()      : null,
                s.getProfissional() != null ? s.getProfissional().getId()   : null,
                s.getProfissional() != null ? s.getProfissional().getNome() : null,
                s.getDataCriacao(),
                s.getDataAtualizacao()
        );
    }
}