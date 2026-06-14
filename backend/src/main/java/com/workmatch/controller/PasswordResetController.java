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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    private final UsuarioRepository      usuarioRepo;
    private final ProfissionalRepository profissionalRepo;
    private final KeycloakUserClient     keycloakUserClient;
    private final KeycloakLoginClient    keycloakLoginClient;

    public PasswordResetController(UsuarioRepository usuarioRepo,
                                   ProfissionalRepository profissionalRepo,
                                   KeycloakUserClient keycloakUserClient,
                                   KeycloakLoginClient keycloakLoginClient) {
        this.usuarioRepo        = usuarioRepo;
        this.profissionalRepo   = profissionalRepo;
        this.keycloakUserClient = keycloakUserClient;
        this.keycloakLoginClient = keycloakLoginClient;
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
}
