package com.workmatch.service;

import com.workmatch.dto.AvaliacaoDTO;
import com.workmatch.dto.response.AvaliacaoResponse;
import com.workmatch.model.Avaliacao;
import com.workmatch.model.Profissional;
import com.workmatch.model.Servico;
import com.workmatch.model.StatusServico;
import com.workmatch.model.Usuario;
import com.workmatch.repository.AvaliacaoRepository;
import com.workmatch.repository.ProfissionalRepository;
import com.workmatch.repository.ServicoRepository;
import com.workmatch.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class AvaliacaoService {

    private final AvaliacaoRepository    avaliacaoRepo;
    private final ServicoRepository      servicoRepo;
    private final UsuarioRepository      usuarioRepo;
    private final ProfissionalRepository profissionalRepo;

    public AvaliacaoService(AvaliacaoRepository avaliacaoRepo,
                            ServicoRepository servicoRepo,
                            UsuarioRepository usuarioRepo,
                            ProfissionalRepository profissionalRepo) {
        this.avaliacaoRepo    = avaliacaoRepo;
        this.servicoRepo      = servicoRepo;
        this.usuarioRepo      = usuarioRepo;
        this.profissionalRepo = profissionalRepo;
    }

    @Transactional
    public AvaliacaoResponse avaliar(AvaliacaoDTO dto) {
        Servico servico = servicoRepo.findById(dto.getServicoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Serviço não encontrado"));

        if (servico.getStatus() != StatusServico.FINALIZADO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Só é possível avaliar serviços finalizados.");
        }

        if (servico.getProfissional() == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Este serviço não possui profissional vinculado.");
        }

        if (avaliacaoRepo.existsByServicoIdAndClienteId(dto.getServicoId(), dto.getClienteId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Você já avaliou este serviço.");
        }

        Usuario cliente = usuarioRepo.findById(dto.getClienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Cliente não encontrado"));

        if (!servico.getCliente().getId().equals(cliente.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Somente o cliente do serviço pode avaliá-lo.");
        }

        Profissional profissional = servico.getProfissional();

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setServico(servico);
        avaliacao.setProfissional(profissional);
        avaliacao.setCliente(cliente);
        avaliacao.setNota(dto.getNota());
        avaliacao.setComentario(dto.getComentario());
        avaliacao = avaliacaoRepo.save(avaliacao);

        // Recalcula média e total do profissional
        double media = avaliacaoRepo.calcularMediaPorProfissional(profissional.getId());
        long   total = avaliacaoRepo.countByProfissionalId(profissional.getId());
        profissional.setAvaliacaoMedia(BigDecimal.valueOf(media).setScale(2, RoundingMode.HALF_UP));
        profissional.setTotalAvaliacoes((int) total);
        profissionalRepo.save(profissional);

        return toResponse(avaliacao);
    }

    public List<AvaliacaoResponse> listarPorProfissional(UUID profissionalId) {
        return avaliacaoRepo.findByProfissionalId(profissionalId)
                .stream().map(this::toResponse).toList();
    }

    // Retorna as avaliações completas feitas por este cliente
    public List<AvaliacaoResponse> listarPorCliente(UUID clienteId) {
        return avaliacaoRepo.findByClienteId(clienteId)
                .stream().map(this::toResponse).toList();
    }

    // Retorna os IDs de serviços já avaliados por este cliente
    public List<UUID> servicosAvaliadosPorCliente(UUID clienteId) {
        return avaliacaoRepo.findByClienteId(clienteId)
                .stream().map(a -> a.getServico().getId()).toList();
    }

    public boolean jaAvaliou(UUID servicoId, UUID clienteId) {
        return avaliacaoRepo.existsByServicoIdAndClienteId(servicoId, clienteId);
    }

    private AvaliacaoResponse toResponse(Avaliacao a) {
        return new AvaliacaoResponse(
                a.getId(),
                a.getServico().getId(),
                a.getProfissional().getId(),
                a.getProfissional().getNome(),
                a.getCliente().getId(),
                a.getCliente().getNome(),
                a.getNota(),
                a.getComentario(),
                a.getCriadoEm()
        );
    }
}