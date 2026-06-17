package com.workmatch.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

/**
 * Gera e valida o token usado no fluxo "Esqueci minha senha".
 *
 * Não usa nenhuma tabela no banco: o token carrega o próprio
 * keycloakId + horário de expiração, assinados com HMAC-SHA256.
 * Se alguém alterar o conteúdo, a assinatura não bate e o token
 * é rejeitado. Expira em 15 minutos.
 */
@Service
public class ResetTokenService {

    private static final long EXPIRACAO_MINUTOS = 15;

    @Value("${app.reset-token.secret}")
    private String secret;

    public String gerarToken(String keycloakId) {
        long expiraEm = System.currentTimeMillis() / 1000 + (EXPIRACAO_MINUTOS * 60);
        String payload = keycloakId + ":" + expiraEm;
        return base64(payload) + "." + assinar(payload);
    }

    public Optional<String> validarToken(String token) {
        try {
            String[] partes = token.split("\\.", 2);
            String payload = new String(Base64.getUrlDecoder().decode(partes[0]), StandardCharsets.UTF_8);
            String assinaturaRecebida = partes[1];

            if (!assinar(payload).equals(assinaturaRecebida)) {
                return Optional.empty();
            }

            String[] dados = payload.split(":", 2);
            String keycloakId = dados[0];
            long expiraEm = Long.parseLong(dados[1]);

            if (System.currentTimeMillis() / 1000 > expiraEm) {
                return Optional.empty();
            }

            return Optional.of(keycloakId);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private String assinar(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao assinar token de redefinição de senha", e);
        }
    }

    private String base64(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }
}
