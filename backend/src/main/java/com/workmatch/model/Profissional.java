package com.workmatch.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Profissional {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String keycloakId;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(unique = true, nullable = false, length = 14)
    private String cpf;

    @Column(unique = true, nullable = false, length = 150)
    private String email;

    @Column(nullable = false, length = 20)
    private String telefone;

    @Column(nullable = false)
    private LocalDate dataNascimento;

    @Column(length = 200)
    private String endereco;

    @Column(length = 100)
    private String cidade;

    @Column(length = 2)
    private String estado;

    @Column(length = 100)
    private String especialidade;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    private Integer experienciaAnos;

    @Column(precision = 3, scale = 2)
    private BigDecimal avaliacaoMedia;

    private Integer totalAvaliacoes;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(unique = true, nullable = false, length = 100)
    private String login;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false, length = 20)
    private String role = "PROFISSIONAL";

    @Column(nullable = false, updatable = false)
    private LocalDateTime dataCadastro;

    @PrePersist
    public void prePersist() {
        this.dataCadastro = LocalDateTime.now();
    }

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Plano plano = Plano.BASICO;

    private LocalDateTime planoValidoAte;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getKeycloakId() { return keycloakId; }
    public void setKeycloakId(String keycloakId) { this.keycloakId = keycloakId; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getEspecialidade() { return especialidade; }
    public void setEspecialidade(String especialidade) { this.especialidade = especialidade; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Integer getExperienciaAnos() { return experienciaAnos; }
    public void setExperienciaAnos(Integer experienciaAnos) { this.experienciaAnos = experienciaAnos; }

    public BigDecimal getAvaliacaoMedia() { return avaliacaoMedia; }
    public void setAvaliacaoMedia(BigDecimal avaliacaoMedia) { this.avaliacaoMedia = avaliacaoMedia; }

    public Integer getTotalAvaliacoes() { return totalAvaliacoes; }
    public void setTotalAvaliacoes(Integer totalAvaliacoes) { this.totalAvaliacoes = totalAvaliacoes; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }

    public Plano getPlano() { return plano; }
    public void setPlano(Plano plano) { this.plano = plano; }

    public LocalDateTime getPlanoValidoAte() { return planoValidoAte; }
    public void setPlanoValidoAte(LocalDateTime planoValidoAte) {
        this.planoValidoAte = planoValidoAte;
    }
}
