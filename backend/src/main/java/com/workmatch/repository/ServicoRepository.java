package com.workmatch.repository;

import com.workmatch.model.Servico;
import com.workmatch.model.StatusServico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ServicoRepository extends JpaRepository<Servico, UUID> {

    // ── Consultas simples (usadas internamente / ciclo de vida) ───────────────

    List<Servico> findByClienteId(UUID clienteId);
    List<Servico> findByClienteIdAndStatus(UUID clienteId, StatusServico status);

    List<Servico> findByProfissionalId(UUID profissionalId);
    List<Servico> findByProfissionalIdAndStatus(UUID profissionalId, StatusServico status);

    List<Servico> findByStatus(StatusServico status);
    List<Servico> findByStatusIn(List<StatusServico> statuses);

    // ── Publicados — paginados (endpoint público /api/servicos/publicados) ────

    Page<Servico> findByStatus(StatusServico status, Pageable pageable);

    Page<Servico> findByEspecialidadeContainingIgnoreCaseAndStatus(
            String especialidade, StatusServico status, Pageable pageable);

    Page<Servico> findByCidadeContainingIgnoreCaseAndStatus(
            String cidade, StatusServico status, Pageable pageable);

    Page<Servico> findByEspecialidadeContainingIgnoreCaseAndCidadeContainingIgnoreCaseAndStatus(
            String especialidade, String cidade, StatusServico status, Pageable pageable);

    // ── Filtros sem paginação (usados em listarPublicados sem página — legado) ─

    List<Servico> findByEspecialidadeContainingIgnoreCaseAndStatus(
            String especialidade, StatusServico status);

    List<Servico> findByCidadeContainingIgnoreCaseAndStatus(
            String cidade, StatusServico status);

    List<Servico> findByEspecialidadeContainingIgnoreCaseAndCidadeContainingIgnoreCaseAndStatus(
            String especialidade, String cidade, StatusServico status);
            
    long countByProfissionalIdAndDataContratacaoGreaterThanEqualAndStatusIn(
        UUID profissionalId, LocalDateTime inicio, Collection<StatusServico> status);
}
