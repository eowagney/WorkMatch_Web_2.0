package com.workmatch.service;

import com.workmatch.dto.LoginDTO;
import com.workmatch.dto.response.LoginResponse;
import com.workmatch.keycloak.KeycloakIntegrationException;
import com.workmatch.keycloak.KeycloakLoginClient;
import com.workmatch.keycloak.KeycloakTokenResponse;
import com.workmatch.model.Profissional;
import com.workmatch.model.Usuario;
import com.workmatch.repository.ProfissionalRepository;
import com.workmatch.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

@Service
public class AuthService {

    private final KeycloakLoginClient    keycloakLoginClient;
    private final UsuarioRepository      usuarioRepo;
    private final ProfissionalRepository profissionalRepo;
    private static final Logger log =
        LoggerFactory.getLogger(AuthService.class);

    public AuthService(KeycloakLoginClient keycloakLoginClient,
                       UsuarioRepository usuarioRepo,
                       ProfissionalRepository profissionalRepo) {
        this.keycloakLoginClient = keycloakLoginClient;
        this.usuarioRepo         = usuarioRepo;
        this.profissionalRepo    = profissionalRepo;
    }

    public LoginResponse login(LoginDTO dto) {

        log.info("Keycloak login: clientId={}, tokenUrl={}",
        properties.getClientId(),
        properties.getTokenUrl());

        // 1. Autentica no Keycloak — valida as credenciais e obtém o JWT
        KeycloakTokenResponse tokenResponse;
        try {
            tokenResponse = keycloakLoginClient.login(dto.login(), dto.senha());
            } catch (KeycloakIntegrationException e) {
        log.error("ERRO NO LOGIN COM KEYCLOAK: {}", e.getMessage(), e);

        throw new ResponseStatusException(
            HttpStatus.UNAUTHORIZED,
            "Erro ao autenticar no Keycloak: " + e.getMessage()
        );
    }

        // 2. Busca o perfil no BD para montar a resposta com os dados do usuário
        Optional<Usuario> usuarioOpt = usuarioRepo.findByLogin(dto.login());
        if (usuarioOpt.isPresent()) {
            Usuario u = usuarioOpt.get();
            return LoginResponse.builder()
                    .token(tokenResponse.getAccessToken())
                    .refreshToken(tokenResponse.getRefreshToken())
                    .expiresIn(tokenResponse.getExpiresIn())
                    .id(u.getId())
                    .nome(u.getNome())
                    .email(u.getEmail())
                    .login(u.getLogin())
                    .role(u.getRole())
                    .build();
        }

        Optional<Profissional> profissionalOpt = profissionalRepo.findByLogin(dto.login());
        if (profissionalOpt.isPresent()) {
            Profissional p = profissionalOpt.get();
            return LoginResponse.builder()
                    .token(tokenResponse.getAccessToken())
                    .refreshToken(tokenResponse.getRefreshToken())
                    .expiresIn(tokenResponse.getExpiresIn())
                    .id(p.getId())
                    .nome(p.getNome())
                    .email(p.getEmail())
                    .login(p.getLogin())
                    .role(p.getRole())
                    .build();
        }

        // Autenticou no Keycloak mas não existe no BD — estado inconsistente
        throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Usuário autenticado, mas não encontrado no sistema");
    }
}