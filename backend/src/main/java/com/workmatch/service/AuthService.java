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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class AuthService {

    private static final Logger log =
            LoggerFactory.getLogger(AuthService.class);

    private final KeycloakLoginClient keycloakLoginClient;
    private final UsuarioRepository usuarioRepo;
    private final ProfissionalRepository profissionalRepo;

    public AuthService(
            KeycloakLoginClient keycloakLoginClient,
            UsuarioRepository usuarioRepo,
            ProfissionalRepository profissionalRepo) {

        this.keycloakLoginClient = keycloakLoginClient;
        this.usuarioRepo = usuarioRepo;
        this.profissionalRepo = profissionalRepo;
    }

    public LoginResponse login(LoginDTO dto) {

        KeycloakTokenResponse tokenResponse;

        try {

            log.info("Iniciando autenticação no Keycloak");

            tokenResponse = keycloakLoginClient.login(
                    dto.login(),
                    dto.senha()
            );

            log.info("Autenticação no Keycloak realizada com sucesso");

        } catch (KeycloakIntegrationException e) {

            log.error(
                    "ERRO NO LOGIN COM KEYCLOAK: {}",
                    e.getMessage(),
                    e
            );

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Erro ao autenticar no Keycloak: " + e.getMessage()
            );
        }

        Optional<Usuario> usuarioOpt =
                usuarioRepo.findByLogin(dto.login());

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

        Optional<Profissional> profissionalOpt =
                profissionalRepo.findByLogin(dto.login());

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

        log.warn(
                "Usuário autenticado no Keycloak, mas não encontrado no banco: {}",
                dto.login()
        );

        throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Usuário autenticado, mas não encontrado no sistema"
        );
    }
}