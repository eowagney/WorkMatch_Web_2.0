package com.workmatch.service;

import com.workmatch.dto.AtualizarProfissionalDTO;
import com.workmatch.dto.UsuarioDTO;
import com.workmatch.keycloak.KeycloakIntegrationException;
import com.workmatch.keycloak.KeycloakRegistrationService;
import com.workmatch.model.Profissional;
import com.workmatch.repository.ProfissionalRepository;
import com.workmatch.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ProfissionalService {

    private final ProfissionalRepository profissionalRepo;
    private final UsuarioRepository      usuarioRepo;
    private final KeycloakRegistrationService keycloakRegistration;

    public ProfissionalService(ProfissionalRepository profissionalRepo,
                               UsuarioRepository usuarioRepo,
                               KeycloakRegistrationService keycloakRegistration) {
        this.profissionalRepo  = profissionalRepo;
        this.usuarioRepo       = usuarioRepo;
        this.keycloakRegistration = keycloakRegistration;
    }

    // ── Cadastro ──────────────────────────────────────────────────────────────

    @Transactional
    public Profissional cadastrar(UsuarioDTO dto) {
        String cpf      = limpar(dto.getCpf());
        String telefone = limpar(dto.getTelefone());
        dto.setCpf(cpf);
        dto.setTelefone(telefone);

        validarUnicidade(dto);

        String keycloakId;
        try {
            keycloakId = keycloakRegistration.register(
                    dto.getLogin(), dto.getEmail(), dto.getNome(), dto.getSenha(), "PROFISSIONAL"
            );
        } catch (KeycloakIntegrationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Falha ao registrar no Keycloak: " + e.getMessage());
        }

        try {
            Profissional p = new Profissional();
            p.setKeycloakId(keycloakId);
            p.setNome(dto.getNome());
            p.setCpf(cpf);
            p.setEmail(dto.getEmail());
            p.setTelefone(telefone);
            p.setDataNascimento(dto.getDataNascimento());
            p.setEndereco(dto.getEndereco());
            p.setCidade(dto.getCidade());
            p.setEstado(dto.getEstado());
            p.setLogin(dto.getLogin());
            p.setSenha("[KEYCLOAK]");   // B04 — nunca persistir senha real
            p.setRole("PROFISSIONAL");
            p.setEspecialidade(dto.getEspecialidade());
            p.setDescricao(dto.getDescricao());
            p.setExperienciaAnos(dto.getExperienciaAnos());
            p.setAtivo(true);
            return profissionalRepo.save(p);
        } catch (Exception e) {
            keycloakRegistration.rollback(keycloakId);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao salvar no banco de dados: " + e.getMessage());
        }
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    public Profissional buscarPorId(UUID id) {
        return profissionalRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Profissional não encontrado"));
    }

    public List<Profissional> listar(String especialidade, String cidade) {
        if (especialidade != null && cidade != null) {
            return profissionalRepo.findByEspecialidadeContainingIgnoreCaseAndCidadeContainingIgnoreCase(
                    especialidade, cidade);
        }
        if (especialidade != null) {
            return profissionalRepo.findByEspecialidadeContainingIgnoreCase(especialidade);
        }
        if (cidade != null) {
            return profissionalRepo.findByCidadeContainingIgnoreCase(cidade);
        }
        return profissionalRepo.findAll();
    }

    @Transactional
    public Profissional atualizar(UUID id, AtualizarProfissionalDTO dto) {
        Profissional p = buscarPorId(id);

        boolean mudouEmail = !dto.email().equalsIgnoreCase(p.getEmail());
        if (mudouEmail && (profissionalRepo.existsByEmail(dto.email()) || usuarioRepo.existsByEmail(dto.email())))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");

        p.setNome(dto.nome());
        p.setEmail(dto.email());
        p.setTelefone(limpar(dto.telefone()));
        p.setEndereco(dto.endereco());
        p.setCidade(dto.cidade());
        p.setEstado(dto.estado());
        p.setEspecialidade(dto.especialidade());
        p.setDescricao(dto.descricao());
        p.setExperienciaAnos(dto.experienciaAnos());
        return profissionalRepo.save(p);
    }

    @Transactional
    public void deletar(UUID id) {
        Profissional p = buscarPorId(id);
        if (p.getKeycloakId() != null) {
            keycloakRegistration.rollback(p.getKeycloakId());
        }
        profissionalRepo.deleteById(id);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validarUnicidade(UsuarioDTO dto) {
        if (profissionalRepo.existsByCpf(dto.getCpf()) || usuarioRepo.existsByCpf(dto.getCpf()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");

        if (profissionalRepo.existsByEmail(dto.getEmail()) || usuarioRepo.existsByEmail(dto.getEmail()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");

        if (profissionalRepo.existsByLogin(dto.getLogin()) || usuarioRepo.existsByLogin(dto.getLogin()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Login já em uso");
    }

    private String limpar(String valor) {
        if (valor == null) return null;
        return valor.replaceAll("\\D", "");
    }
}
