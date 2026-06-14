package gateway.main.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final WebClient webClient;
    private final String    introspectUrl;
    private final String    clientId;
    private final String    clientSecret;

    /*
     * Endpoints que não precisam de token.
     * POST /api/usuarios e POST /api/profissionais são públicos (cadastro).
     * GET /api/servicos/publicados é público (vitrine).
     */
    private static final Set<String> PUBLIC_EXACT_ANY_METHOD = Set.of(
            "/api/login",
            "/api/auth/recuperar-senha",
            "/api/auth/refresh"
    );

    private static final List<String> PUBLIC_PREFIX_ANY_METHOD = List.of(
            "/api/validar/"
    );

    // Par método+path para endpoints que precisam de verificação de método
    private static final List<String[]> PUBLIC_METHOD_PATH = List.of(
            new String[]{"POST",  "/api/usuarios"},
            new String[]{"POST",  "/api/profissionais"},
            new String[]{"GET",   "/api/servicos/publicados"}
    );

    public JwtAuthFilter(
            WebClient.Builder webClientBuilder,
            @Value("${keycloak.introspect-url}") String introspectUrl,
            @Value("${keycloak.client-id}")       String clientId,
            @Value("${keycloak.client-secret}")   String clientSecret) {
        this.webClient    = webClientBuilder.build();
        this.introspectUrl = introspectUrl;
        this.clientId     = clientId;
        this.clientSecret = clientSecret;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest req  = exchange.getRequest();
        String            path = req.getPath().value();
        HttpMethod        method = req.getMethod();

        if (isPublic(path, method)) {
            return chain.filter(exchange);
        }

        List<String> authHeaders = req.getHeaders().get(HttpHeaders.AUTHORIZATION);
        if (authHeaders == null || authHeaders.isEmpty()) {
            return rejeitar(exchange, "Token de autenticação ausente");
        }

        String bearer = authHeaders.get(0);
        if (!bearer.startsWith("Bearer ")) {
            return rejeitar(exchange, "Formato de token inválido");
        }

        String token = bearer.substring(7);

        return introspect(token)
                .flatMap(ativo -> {
                    if (ativo) {
                        return chain.filter(exchange);
                    }
                    return rejeitar(exchange, "Token inválido ou expirado");
                })
                .onErrorResume(e -> {
                    log.error("Erro ao validar token: {}", e.getMessage());
                    return rejeitar(exchange, "Erro interno ao validar autenticação");
                });
    }

    private boolean isPublic(String path, HttpMethod method) {
        if (PUBLIC_EXACT_ANY_METHOD.contains(path)) return true;

        for (String prefix : PUBLIC_PREFIX_ANY_METHOD) {
            if (path.startsWith(prefix)) return true;
        }

        for (String[] pair : PUBLIC_METHOD_PATH) {
            if (pair[0].equals(method.name()) && path.equals(pair[1])) return true;
        }

        return false;
    }

    private Mono<Boolean> introspect(String token) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("token",         token);
        form.add("client_id",     clientId);
        form.add("client_secret", clientSecret);

        return webClient.post()
                .uri(introspectUrl)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                .body(BodyInserters.fromFormData(form))
                .retrieve()
                .bodyToMono(Map.class)
                .map(body -> Boolean.TRUE.equals(body.get("active")))
                .onErrorReturn(false);
    }

    private Mono<Void> rejeitar(ServerWebExchange exchange, String mensagem) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        byte[]     bytes  = ("{\"error\":\"" + mensagem + "\"}").getBytes();
        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -100; // executa antes de qualquer rota
    }
}
