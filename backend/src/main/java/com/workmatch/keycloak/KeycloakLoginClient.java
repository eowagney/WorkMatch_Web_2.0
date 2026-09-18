package com.workmatch.keycloak;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
public class KeycloakLoginClient {

    private static final Logger log =
        LoggerFactory.getLogger(KeycloakLoginClient.class);

    private final WebClient          webClient;
    private final KeycloakProperties properties;

    public KeycloakLoginClient(WebClient.Builder webClientBuilder,
                               KeycloakProperties properties) {
        this.webClient  = webClientBuilder.build();
        this.properties = properties;
    }

    public KeycloakTokenResponse login(String login, String senha) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type",    "password");
        form.add("client_id",     properties.getClientId());
        form.add("client_secret", properties.getClientSecret());
        form.add("username",      login);
        form.add("password",      senha);
        form.add("scope",         "openid");

        log.info(
        "Tentando autenticar no Keycloak: clientId={}, tokenUrl={}",
        properties.getClientId(),
        properties.getTokenUrl()
        );

        return chamadaToken(form);
    }

    /*
     * Troca um refresh_token expirado por um novo par access_token / refresh_token.
     * Essencial para mobile — o access token expira em ~5 min e o app não pode
     * pedir as credenciais novamente sem motivo.
     */
    public KeycloakTokenResponse refresh(String refreshToken) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type",    "refresh_token");
        form.add("client_id",     properties.getClientId());
        form.add("client_secret", properties.getClientSecret());
        form.add("refresh_token", refreshToken);

        return chamadaToken(form);
    }

    private KeycloakTokenResponse chamadaToken(MultiValueMap<String, String> form) {
        try {
            KeycloakTokenResponse response = webClient.post()
                    .uri(properties.getTokenUrl())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                    .body(BodyInserters.fromFormData(form))
                    .retrieve()
                    .bodyToMono(KeycloakTokenResponse.class)
                    .block();

            if (response == null || response.getAccessToken() == null) {
                throw new KeycloakIntegrationException("Resposta de token nula do Keycloak");
            }

            return response;

        } catch (WebClientResponseException.Unauthorized e) {
            log.error("Keycloak 401: {}", e.getResponseBodyAsString());
            throw new KeycloakIntegrationException("Credenciais ou token inválidos");
        } catch (WebClientResponseException e) {
            log.error("Keycloak {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new KeycloakIntegrationException("Erro Keycloak: " + e.getStatusCode());
        } catch (Exception e) {
            log.error("Erro ao chamar Keycloak: {}", e.getMessage(), e);
            throw new KeycloakIntegrationException("Erro de comunicação com Keycloak");
        }
    }
}
