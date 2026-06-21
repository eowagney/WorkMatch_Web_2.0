package com.workmatch.dto;

import com.workmatch.validation.CpfValida;
import com.workmatch.validation.EmailValida;
import com.workmatch.validation.TelefoneValida;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class UsuarioDTO {

        @NotBlank(message = "Nome é obrigatório")
        private String nome;

        @NotBlank(message = "CPF é obrigatório")
        @CpfValida
        private String cpf;

        @NotBlank(message = "E-mail é obrigatório")
        @EmailValida
        private String email;

        @NotBlank(message = "Telefone é obrigatório")
        @TelefoneValida
        private String telefone;

        @NotNull(message = "Data de nascimento é obrigatória")
        private LocalDate dataNascimento;

        private String endereco;
        private String cidade;

        @Size(max = 2, message = "Estado deve ter 2 letras")
        private String estado;

        @NotBlank(message = "Login é obrigatório")
        @Size(min = 4, message = "Login mínimo de 4 caracteres")
        private String login;

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 6, message = "Senha mínima de 6 caracteres")
        private String senha;

        // Role é sempre definida pelo controller (CLIENTE ou PROFISSIONAL)
        // Não validada aqui para evitar falha quando o frontend não envia
        private String role;

        // Exclusivos de Profissional
        private String especialidade;
        private String descricao;
        private Integer experienciaAnos;
        private BigDecimal avaliacaoMedia;
        private Integer totalAvaliacoes;
}