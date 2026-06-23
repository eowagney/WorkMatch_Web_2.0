package com.workmatch.service;

import com.workmatch.dto.ServicoDTO;
import com.workmatch.dto.response.CandidatureResponse;
import com.workmatch.dto.response.PageResponse;
import com.workmatch.dto.response.ServicoResponse;
import com.workmatch.model.Profissional;
import com.workmatch.model.Servico;
import com.workmatch.model.StatusServico;
import com.workmatch.model.Usuario;
import com.workmatch.repository.CandidatureRepository;
import com.workmatch.repository.ProfissionalRepository;
import com.workmatch.repository.ServicoRepository;
import com.workmatch.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ServicoService {

    private final ServicoRepository servicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProfissionalRepository profissionalRepository;
    private final MapperService mapper;
    private final CandidatureRepository candidatureRepository;

    public ServicoService(
            ServicoRepository servicoRepository,
            UsuarioRepository usuarioRepository,
            ProfissionalRepository profissionalRepository,
            MapperService mapper,
            CandidatureRepository candidatureRepository) {

        this.servicoRepository = servicoRepository;
        this.usuarioRepository = usuarioRepository;
        this.profissionalRepository = profissionalRepository;
        this.mapper = mapper;
        this.candidatureRepository = candidatureRepository;
    }

    @Transactional
    public ServicoResponse criar(ServicoDTO dto) {
        Usuario cliente = usuarioRepository.findById(dto.clienteId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cliente não encontrado"));

        Servico servico = new Servico();
        servico.setTitulo(dto.titulo());
        servico.setEspecialidade(dto.especialidade());
        servico.setDescricao(dto.descricao());
        servico.setCidade(dto.cidade());
        servico.setEstado(dto.estado());
        servico.setCliente(cliente);
        servico.setStatus(StatusServico.PUBLICADO);

        return mapper.toResponse(servicoRepository.save(servico));
    }

    public ServicoResponse buscarPorId(UUID id) {
        return mapper.toResponse(buscarEntidade(id));
    }

    public List<ServicoResponse> listarPorCliente(
            UUID clienteId,
            StatusServico status) {

        List<Servico> servicos = status != null
                ? servicoRepository.findByClienteIdAndStatus(clienteId, status)
                : servicoRepository.findByClienteId(clienteId);

        return servicos.stream()
                .map(mapper::toResponse)
                .toList();
    }

    public List<ServicoResponse> listarPorProfissional(
            UUID profissionalId,
            StatusServico status) {

        List<Servico> servicos = status != null
                ? servicoRepository.findByProfissionalIdAndStatus(
                        profissionalId,
                        status)
                : servicoRepository.findByProfissionalId(profissionalId);

        return servicos.stream()
                .map(mapper::toResponse)
                .toList();
    }

    public PageResponse<ServicoResponse> listarPublicados(
            String especialidade,
            String cidade,
            int page,
            int size) {

        int safeSize = Math.min(size, 50);

        Pageable pageable = PageRequest.of(
                page,
                safeSize,
                Sort.by(Sort.Direction.DESC, "dataCriacao"));

        Page<Servico> resultado;

        if (especialidade != null && cidade != null) {
            resultado =
                    servicoRepository
                            .findByEspecialidadeContainingIgnoreCaseAndCidadeContainingIgnoreCaseAndStatus(
                                    especialidade,
                                    cidade,
                                    StatusServico.PUBLICADO,
                                    pageable);

        } else if (especialidade != null) {

            resultado =
                    servicoRepository
                            .findByEspecialidadeContainingIgnoreCaseAndStatus(
                                    especialidade,
                                    StatusServico.PUBLICADO,
                                    pageable);

        } else if (cidade != null) {

            resultado =
                    servicoRepository
                            .findByCidadeContainingIgnoreCaseAndStatus(
                                    cidade,
                                    StatusServico.PUBLICADO,
                                    pageable);

        } else {

            resultado =
                    servicoRepository.findByStatus(
                            StatusServico.PUBLICADO,
                            pageable);
        }

        return PageResponse.of(resultado.map(mapper::toResponse));
    }

    @Transactional
    public ServicoResponse avancarStatus(UUID id, UUID profissionalId) {

        Servico servico = buscarEntidade(id);

        StatusServico proximo = proximoStatus(servico.getStatus());

        if (proximo == StatusServico.NEGOCIANDO
                || proximo == StatusServico.CONTRATADO) {

            Profissional profissional =
                    profissionalRepository.findById(profissionalId)
                            .orElseThrow(() ->
                                    new ResponseStatusException(
                                            HttpStatus.NOT_FOUND,
                                            "Profissional não encontrado"));

            servico.setProfissional(profissional);
        }

        servico.setStatus(proximo);

        return mapper.toResponse(servicoRepository.save(servico));
    }

    @Transactional
    public ServicoResponse arquivar(UUID id) {

        Servico servico = buscarEntidade(id);

        if (servico.getStatus() == StatusServico.FINALIZADO
                || servico.getStatus() == StatusServico.CANCELADO) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Serviço já encerrado");
        }

        servico.setStatus(StatusServico.CANCELADO);

        return mapper.toResponse(servicoRepository.save(servico));
    }

    @Transactional
    public void cancelar(UUID id) {

        Servico servico = buscarEntidade(id);

        if (servico.getStatus() == StatusServico.FINALIZADO) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Serviço finalizado não pode ser cancelado");
        }

        servicoRepository.deleteById(id);
    }

    public List<CandidatureResponse> listarPorServico(UUID servicoId) {

        return candidatureRepository.findByServicoId(servicoId)
                .stream()
                .map(c -> new CandidatureResponse(
                        c.getId(),
                        c.getServico().getId(),
                        c.getProfissional().getId(),
                        c.getProfissional().getNome(),
                        c.getProfissional().getEspecialidade(),
                        c.getProfissional().getCidade(),
                        c.getProfissional().getEstado(),
                        c.getCriadoEm(),
                        c.getProfissional().getAvaliacaoMedia(),
                        c.getProfissional().getTotalAvaliacoes(),
                        c.getProfissional().getExperienciaAnos()
                ))
                .toList();
    }

    private Servico buscarEntidade(UUID id) {

        return servicoRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Serviço não encontrado"));
    }

    private StatusServico proximoStatus(StatusServico atual) {

        return switch (atual) {
            case PUBLICADO -> StatusServico.NEGOCIANDO;
            case NEGOCIANDO -> StatusServico.CONTRATADO;
            case CONTRATADO -> StatusServico.ANDAMENTO;
            case ANDAMENTO -> StatusServico.FINALIZADO;

            case FINALIZADO ->
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Serviço já finalizado");

            case CANCELADO ->
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Serviço arquivado não pode ter status avançado");
        };
    }
}