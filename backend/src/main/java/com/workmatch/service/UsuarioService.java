package com.workmatch.service;

import com.workmatch.dto.UsuarioDTO;
import com.workmatch.keycloak.KeycloakIntegrationException;
import com.workmatch.keycloak.KeycloakRegistrationService;
import com.workmatch.model.Profissional;
import com.workmatch.model.Usuario;
import com.workmatch.repository.ProfissionalRepository;
import com.workmatch.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository      usuarioRepo;
    private final ProfissionalRepository profissionalRepo;
    private final KeycloakRegistrationService keycloakRegistration;

    public UsuarioService(UsuarioRepository usuarioRepo,
                          ProfissionalRepository profissionalRepo,
                          KeycloakRegistrationService keycloakRegistration) {
        this.usuarioRepo          = usuarioRepo;
        this.profissionalRepo     = profissionalRepo;
        this.keycloakRegistration = keycloakRegistration;
    }

    // ── Cadastro ──────────────────────────────────────────────────────────────

    @Transactional
    public Object cadastrar(UsuarioDTO dto) {

        String cpf      = limpar(dto.getCpf());
        String telefone = limpar(dto.getTelefone());

        dto.setCpf(cpf);
        dto.setTelefone(telefone);

        validarUnicidade(dto);

        String keycloakId;
        try {
            keycloakId = keycloakRegistration.register(
                    dto.getLogin(),
                    dto.getEmail(),
                    dto.getNome(),
                    dto.getSenha(),
                    dto.getRole()
            );
        } catch (KeycloakIntegrationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Falha ao registrar no Keycloak: " + e.getMessage());
        }

        try {
            if ("PROFISSIONAL".equalsIgnoreCase(dto.getRole())) {
                return salvarProfissional(dto, keycloakId);
            } else {
                return salvarUsuario(dto, keycloakId);
            }
        } catch (Exception e) {
            keycloakRegistration.rollback(keycloakId);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Falha ao salvar no banco de dados: " + e.getMessage());
        }
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    public Usuario buscarPorId(UUID id) {
        return usuarioRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Usuário não encontrado"));
    }

    @Transactional
    public Usuario atualizar(UUID id, UsuarioDTO dto) {
        Usuario u = buscarPorId(id);
        u.setNome(dto.getNome());
        u.setEmail(dto.getEmail());
        u.setTelefone(limpar(dto.getTelefone()));
        u.setEndereco(dto.getEndereco());
        u.setCidade(dto.getCidade());
        u.setEstado(dto.getEstado());
        return usuarioRepo.save(u);
    }

    @Transactional
    public void deletar(UUID id) {
        Usuario u = buscarPorId(id);
        if (u.getKeycloakId() != null) {
            keycloakRegistration.rollback(u.getKeycloakId());
        }
        usuarioRepo.delete(u);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Remove qualquer caractere não-numérico (máscaras de CPF, telefone, CEP etc.) */
    private String limpar(String valor) {
        if (valor == null) return null;
        return valor.replaceAll("\\D", "");
    }

    private void validarUnicidade(UsuarioDTO dto) {
        if (usuarioRepo.existsByCpf(dto.getCpf()) || profissionalRepo.existsByCpf(dto.getCpf()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF já cadastrado");

        if (usuarioRepo.existsByEmail(dto.getEmail()) || profissionalRepo.existsByEmail(dto.getEmail()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");

        if (usuarioRepo.existsByLogin(dto.getLogin()) || profissionalRepo.existsByLogin(dto.getLogin()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Login já em uso");
    }

    private Usuario salvarUsuario(UsuarioDTO dto, String keycloakId) {
        Usuario u = new Usuario();
        u.setKeycloakId(keycloakId);
        u.setNome(dto.getNome());
        u.setCpf(dto.getCpf());
        u.setEmail(dto.getEmail());
        u.setTelefone(dto.getTelefone());
        u.setDataNascimento(dto.getDataNascimento());
        u.setEndereco(dto.getEndereco());
        u.setCidade(dto.getCidade());
        u.setEstado(dto.getEstado());
        u.setLogin(dto.getLogin());
        u.setSenha("[KEYCLOAK]");
        u.setRole("CLIENTE");
        return usuarioRepo.save(u);
    }

    private Profissional salvarProfissional(UsuarioDTO dto, String keycloakId) {
        Profissional p = new Profissional();
        p.setKeycloakId(keycloakId);
        p.setNome(dto.getNome());
        p.setCpf(dto.getCpf());
        p.setEmail(dto.getEmail());
        p.setTelefone(dto.getTelefone());
        p.setDataNascimento(dto.getDataNascimento());
        p.setEndereco(dto.getEndereco());
        p.setCidade(dto.getCidade());
        p.setEstado(dto.getEstado());
        p.setLogin(dto.getLogin());
        p.setSenha("[KEYCLOAK]");
        p.setRole("PROFISSIONAL");
        p.setEspecialidade(dto.getEspecialidade());
        p.setDescricao(dto.getDescricao());
        p.setExperienciaAnos(dto.getExperienciaAnos());
        p.setAtivo(true);
        return profissionalRepo.save(p);
    }
}