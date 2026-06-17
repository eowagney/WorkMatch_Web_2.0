package com.workmatch.repository;

import com.workmatch.model.Profissional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfissionalRepository extends JpaRepository<Profissional, UUID> {

    boolean existsByCpf(String cpf);
    boolean existsByEmail(String email);
    boolean existsByLogin(String login);

    Optional<Profissional> findByLogin(String login);
    Optional<Profissional> findByEmail(String email);
    Optional<Profissional> findByCpf(String cpf);
    Optional<Profissional> findByKeycloakId(String keycloakId);

    List<Profissional> findByCidadeContainingIgnoreCase(String cidade);

    List<Profissional> findByEspecialidadeContainingIgnoreCase(String especialidade);

    List<Profissional> findByEspecialidadeContainingIgnoreCaseAndCidadeContainingIgnoreCase(String especialidade, String cidade);
}