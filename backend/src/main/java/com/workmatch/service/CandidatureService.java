package com.workmatch.service;

import com.workmatch.dto.CandidatureDTO;
import com.workmatch.dto.MenssengerDTO;
import com.workmatch.dto.response.CandidatureResponse;
import com.workmatch.model.Candidature;
import com.workmatch.model.Profissional;
import com.workmatch.model.Servico;
import com.workmatch.repository.CandidatureRepository;
import com.workmatch.repository.ProfissionalRepository;
import com.workmatch.repository.ServicoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class CandidatureService {

    private final CandidatureRepository  candidatureRepository;
    private final ServicoRepository      servicoRepository;
    private final ProfissionalRepository profissionalRepository;
    private final MenssengerService      menssengerService;

    public CandidatureService(CandidatureRepository candidatureRepository,
                               ServicoRepository servicoRepository,
                               ProfissionalRepository profissionalRepository,
                               MenssengerService menssengerService) {
        this.candidatureRepository  = candidatureRepository;
        this.servicoRepository      = servicoRepository;
        this.profissionalRepository = profissionalRepository;
        this.menssengerService      = menssengerService;
    }

    public CandidatureResponse criar(CandidatureDTO dto) {
        if (candidatureRepository.existsByServicoIdAndProfissionalId(
                dto.getServicoId(), dto.getProfissionalId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Você já se candidatou para este serviço.");
        }

        Servico servico = servicoRepository.findById(dto.getServicoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Serviço não encontrado"));

        Profissional profissional = profissionalRepository.findById(dto.getProfissionalId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Profissional não encontrado"));

        Candidature candidatura = new Candidature();
        candidatura.setServico(servico);
        candidatura.setProfissional(profissional);
        candidatura = candidatureRepository.save(candidatura);

        MenssengerDTO msg = new MenssengerDTO();
        msg.setServicoId(servico.getId());
        msg.setRemetenteId(profissional.getId());
        msg.setRemetenteTipo("PROFISSIONAL");
        msg.setDestinatarioId(servico.getCliente().getId());
        msg.setConteudo("Olá! Me candidatei para este serviço e estou disponível para conversar.");
        menssengerService.enviar(msg);

        return toResponse(candidatura);
    }

    public List<CandidatureResponse> listarPorServico(UUID servicoId) {
        return candidatureRepository.findByServicoId(servicoId)
                .stream().map(this::toResponse).toList();
    }

    public List<CandidatureResponse> listarPorProfissional(UUID profissionalId) {
        return candidatureRepository.findByProfissionalId(profissionalId)
                .stream().map(this::toResponse).toList();
    }

    private CandidatureResponse toResponse(Candidature c) {
        Profissional p = c.getProfissional();
        return new CandidatureResponse(
                c.getId(),
                c.getServico().getId(),
                p.getId(),
                p.getNome(),
                p.getEspecialidade(),
                p.getCidade(),
                p.getEstado(),
                c.getCriadoEm(),
                p.getAvaliacaoMedia(),
                p.getTotalAvaliacoes(),
                p.getExperienciaAnos()  // faltava este campo
        );
    }
}