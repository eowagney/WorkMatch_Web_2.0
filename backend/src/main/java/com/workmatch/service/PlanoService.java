package com.workmatch.service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.workmatch.model.Plano;
import com.workmatch.model.PlanosProperties;
import com.workmatch.model.Profissional;
import com.workmatch.model.StatusServico;
import com.workmatch.repository.ServicoRepository;

@Service
public class PlanoService {

    private static final List<StatusServico> CONTAM =
            List.of(StatusServico.CONTRATADO, StatusServico.ANDAMENTO, StatusServico.FINALIZADO);

    private final PlanosProperties props;
    private final ServicoRepository servicoRepo;

    public PlanoService(PlanosProperties props, ServicoRepository servicoRepo) {
        this.props = props;
        this.servicoRepo = servicoRepo;
    }

    public boolean ativo() { return props.isAtivo(); }

    public Plano planoEfetivo(Profissional p) {
        Plano pl = p.getPlano() == null ? Plano.BASICO : p.getPlano();
        boolean vencido = pl != Plano.BASICO && p.getPlanoValidoAte() != null
                && p.getPlanoValidoAte().isBefore(LocalDateTime.now());
        return vencido ? Plano.BASICO : pl;
    }

    public long usadosNoMes(UUID profissionalId) {
        LocalDateTime inicio = YearMonth.now().atDay(1).atStartOfDay();
        return servicoRepo.countByProfissionalIdAndDataContratacaoGreaterThanEqualAndStatusIn(
                profissionalId, inicio, CONTAM);
    }

    /** Não faz nada com os planos desligados. */
    public void validarPodeContratar(Profissional p) {
        if (!props.isAtivo() || planoEfetivo(p) != Plano.BASICO) return;
        if (usadosNoMes(p.getId()) >= props.getLimiteBasicoMensal())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você atingiu o limite de " + props.getLimiteBasicoMensal()
                    + " serviços do plano Básico neste mês. Faça upgrade para continuar.");
    }

    public Map<String, Object> status(Profissional p) {
        Plano plano = planoEfetivo(p);
        Integer limite = plano == Plano.BASICO ? props.getLimiteBasicoMensal() : null;
        long usados = usadosNoMes(p.getId());
        Map<String, Object> m = new HashMap<>();
        m.put("ativo", props.isAtivo());
        m.put("plano", plano.name());
        m.put("limiteMensal", limite);
        m.put("usadosNoMes", usados);
        m.put("restantes", limite == null ? null : Math.max(0, limite - usados));
        return m;
    }
}