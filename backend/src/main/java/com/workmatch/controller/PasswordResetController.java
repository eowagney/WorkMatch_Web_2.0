package com.workmatch.controller;

import com.workmatch.dto.response.RefreshResponse;
import com.workmatch.keycloak.KeycloakIntegrationException;
import com.workmatch.keycloak.KeycloakLoginClient;
import com.workmatch.keycloak.KeycloakTokenResponse;
import com.workmatch.keycloak.KeycloakUserClient;
import com.workmatch.model.Profissional;
import com.workmatch.model.Usuario;
import com.workmatch.repository.ProfissionalRepository;
import com.workmatch.repository.UsuarioRepository;
import com.workmatch.service.ResetTokenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final UsuarioRepository      usuarioRepo;
    private final ProfissionalRepository profissionalRepo;
    private final KeycloakUserClient     keycloakUserClient;
    private final KeycloakLoginClient    keycloakLoginClient;
    private final ResetTokenService      resetTokenService;

    public PasswordResetController(UsuarioRepository usuarioRepo,
                                   ProfissionalRepository profissionalRepo,
                                   KeycloakUserClient keycloakUserClient,
                                   KeycloakLoginClient keycloakLoginClient,
                                   ResetTokenService resetTokenService) {
        this.usuarioRepo        = usuarioRepo;
        this.profissionalRepo   = profissionalRepo;
        this.keycloakUserClient = keycloakUserClient;
        this.keycloakLoginClient = keycloakLoginClient;
        this.resetTokenService  = resetTokenService;
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "refreshToken é obrigatório");
        }

        try {
            KeycloakTokenResponse resp = keycloakLoginClient.refresh(refreshToken);
            return ResponseEntity.ok(new RefreshResponse(
                    resp.getAccessToken(),
                    resp.getRefreshToken(),
                    resp.getExpiresIn(),
                    resp.getRefreshExpiresIn()
            ));
        } catch (KeycloakIntegrationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Refresh token inválido ou expirado. Faça login novamente.");
        }
    }

    /*
     * Dispara e-mail de recuperação de senha via Keycloak.
     * Retorna sempre 200 — não vaza se o login/e-mail existe.
     */
    @PostMapping("/recuperar-senha")
    public ResponseEntity<Map<String, String>> recuperarSenha(@RequestBody Map<String, String> body) {
        String login = body.get("login");
        String email = body.get("email");

        String keycloakId = resolverKeycloakId(login, email);

        if (keycloakId != null) {
            try {
                keycloakUserClient.solicitarResetSenha(keycloakId);
            } catch (KeycloakIntegrationException ignored) {
                // Silenciado — não vazar informação de existência do usuário
            }
        }

        return ResponseEntity.ok(Map.of(
                "message", "Se o login informado estiver cadastrado, você receberá um e-mail de recuperação."
        ));
    }

    private String resolverKeycloakId(String login, String email) {
        if (login != null && !login.isBlank()) {
            Optional<Usuario> u = usuarioRepo.findByLogin(login);
            if (u.isPresent()) return u.get().getKeycloakId();
            Optional<Profissional> p = profissionalRepo.findByLogin(login);
            if (p.isPresent()) return p.get().getKeycloakId();
        }
        if (email != null && !email.isBlank()) {
            Optional<Usuario> u = usuarioRepo.findByEmail(email);
            if (u.isPresent()) return u.get().getKeycloakId();
            Optional<Profissional> p = profissionalRepo.findByEmail(email);
            if (p.isPresent()) return p.get().getKeycloakId();
        }
        return null;
    }

    /*
     * Tela "Esqueci minha senha" — Passo 1.
     * Confere CPF + data de nascimento contra usuarios e profissionais.
     * Se bater, devolve um token temporário (15 min) pra usar no Passo 2.
     */
    @PostMapping("/esqueci-senha/verificar")
    public ResponseEntity<Map<String, String>> verificarIdentidade(@RequestBody Map<String, String> body) {
        String cpf = body.get("cpf");
        String dataNascimentoStr = body.get("dataNascimento");

        if (cpf == null || cpf.isBlank() || dataNascimentoStr == null || dataNascimentoStr.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CPF e data de nascimento são obrigatórios");
        }

        LocalDate dataNascimento;
        try {
            dataNascimento = LocalDate.parse(dataNascimentoStr);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data de nascimento inválida");
        }

        String keycloakId = buscarKeycloakIdPorCpfEData(cpf, dataNascimento);

        if (keycloakId == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "CPF ou data de nascimento não encontrados.");
        }

        String resetToken = resetTokenService.gerarToken(keycloakId);
        return ResponseEntity.ok(Map.of("resetToken", resetToken));
    }

    /*
     * Tela "Esqueci minha senha" — Passo 2.
     * Valida o token do Passo 1 e troca a senha de verdade no Keycloak
     * (é o Keycloak quem decide se o login funciona, não a coluna "senha"
     * do nosso banco — por isso chamamos o keycloakUserClient aqui).
     */
    @PostMapping("/esqueci-senha/redefinir")
    public ResponseEntity<Map<String, String>> redefinirSenha(@RequestBody Map<String, String> body) {
        String resetToken = body.get("resetToken");
        String novaSenha   = body.get("novaSenha");

        if (resetToken == null || novaSenha == null || novaSenha.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Token e nova senha (mínimo 6 caracteres) são obrigatórios");
        }

        String keycloakId = resetTokenService.validarToken(resetToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Link expirado. Refaça o processo de recuperação."));

        keycloakUserClient.resetPassword(keycloakId, novaSenha);
        atualizarSenhaLocal(keycloakId, novaSenha);

        return ResponseEntity.ok(Map.of("message", "Senha redefinida com sucesso."));
    }

    private String buscarKeycloakIdPorCpfEData(String cpf, LocalDate dataNascimento) {
        Optional<Usuario> u = usuarioRepo.findByCpf(cpf);
        if (u.isPresent() && dataNascimento.equals(u.get().getDataNascimento())) {
            return u.get().getKeycloakId();
        }
        Optional<Profissional> p = profissionalRepo.findByCpf(cpf);
        if (p.isPresent() && dataNascimento.equals(p.get().getDataNascimento())) {
            return p.get().getKeycloakId();
        }
        return null;
    }

    /* Mantém a coluna "senha" local em sincronia (não é ela que valida o
       login — isso é feito pelo Keycloak — mas evita deixar dado velho). */
    private void atualizarSenhaLocal(String keycloakId, String novaSenha) {
        usuarioRepo.findByKeycloakId(keycloakId).ifPresent(u -> {
            u.setSenha(novaSenha);
            usuarioRepo.save(u);
        });
        profissionalRepo.findByKeycloakId(keycloakId).ifPresent(p -> {
            p.setSenha(novaSenha);
            profissionalRepo.save(p);
        });
    }
}