package com.workmatch.service;

import com.workmatch.dto.MenssengerDTO;
import com.workmatch.dto.response.MenssengerResponse;
import com.workmatch.model.Menssenger;
import com.workmatch.model.Profissional;
import com.workmatch.model.Servico;
import com.workmatch.model.Usuario;
import com.workmatch.repository.CandidatureRepository;
import com.workmatch.repository.MenssengerRepository;
import com.workmatch.repository.ProfissionalRepository;
import com.workmatch.repository.ServicoRepository;
import com.workmatch.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class MenssengerServiceImpl extends MenssengerService {

    private final MenssengerRepository  repository;
    private final UsuarioRepository     usuarioRepository;
    private final ServicoRepository     servicoRepository;
    private final CandidatureRepository candidatureRepository;
    private final ProfissionalRepository profissionalRepository;

    public MenssengerServiceImpl(MenssengerRepository repository,
                                 UsuarioRepository usuarioRepository,
                                 ServicoRepository servicoRepository,
                                 CandidatureRepository candidatureRepository,
                                 ProfissionalRepository profissionalRepository) {
        this.repository            = repository;
        this.usuarioRepository     = usuarioRepository;
        this.servicoRepository     = servicoRepository;
        this.candidatureRepository = candidatureRepository;
        this.profissionalRepository = profissionalRepository;
    }

    @Override
    public MenssengerResponse enviar(MenssengerDTO dto) {
        Servico servico = servicoRepository.findById(dto.getServicoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Serviço não encontrado"));

        Menssenger mensagem = new Menssenger();
        mensagem.setServico(servico);
        mensagem.setConteudo(dto.getConteudo());

        MenssengerResponse response = new MenssengerResponse();
        response.setServicoId(servico.getId());
        response.setConteudo(dto.getConteudo());

        boolean ehCliente = "CLIENTE".equalsIgnoreCase(dto.getRemetenteTipo());

        if (ehCliente) {
            response = enviarComoCliente(dto, mensagem, servico, response);
        } else {
            response = enviarComoProfissional(dto, mensagem, servico, response);
        }

        Menssenger salvo = repository.save(mensagem);
        response.setId(salvo.getId());
        response.setEnviadoEm(salvo.getEnviadoEm());
        return response;
    }

    private MenssengerResponse enviarComoCliente(MenssengerDTO dto,
                                                  Menssenger mensagem,
                                                  Servico servico,
                                                  MenssengerResponse response) {
        Usuario remetente = usuarioRepository.findById(dto.getRemetenteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Remetente não encontrado"));

        // Garante que o remetente é o dono do serviço
        if (!servico.getCliente().getId().equals(remetente.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você não tem acesso a esta conversa.");
        }

        mensagem.setRemetenteUsuario(remetente);
        mensagem.setRemetenteTipo("CLIENTE");

        response.setRemetenteId(remetente.getId());
        response.setRemetenteNome(remetente.getNome());
        response.setRemetenteTipo("CLIENTE");
        // destinatario é o profissional do serviço — não há FK para profissionais aqui,
        // mas o frontend já conhece o profissionalId pela URL
        if (servico.getProfissional() != null) {
            response.setDestinatarioId(servico.getProfissional().getId());
        }
        return response;
    }

    private MenssengerResponse enviarComoProfissional(MenssengerDTO dto,
                                                       Menssenger mensagem,
                                                       Servico servico,
                                                       MenssengerResponse response) {
        Profissional remetente = profissionalRepository.findById(dto.getRemetenteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Profissional não encontrado"));

        boolean possuiCandidatura = candidatureRepository.existsByServicoIdAndProfissionalId(
                dto.getServicoId(), dto.getRemetenteId());
        if (!possuiCandidatura) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Você não pode conversar neste serviço.");
        }

        if (dto.getDestinatarioId() == null) {
            // Tenta resolver pelo cliente do serviço
            if (servico.getCliente() != null) {
                dto.setDestinatarioId(servico.getCliente().getId());
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "destinatarioId é obrigatório para mensagens de profissional.");
            }
        }

        Usuario destinatario = usuarioRepository.findById(dto.getDestinatarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Destinatário não encontrado"));

        mensagem.setRemetente(remetente);
        mensagem.setDestinatario(destinatario);
        mensagem.setRemetenteTipo("PROFISSIONAL");

        response.setRemetenteId(remetente.getId());
        response.setRemetenteNome(remetente.getNome());
        response.setRemetenteTipo("PROFISSIONAL");
        response.setDestinatarioId(destinatario.getId());
        return response;
    }

    @Override
    public List<MenssengerResponse> listarPorServico(UUID servicoId) {
        return repository.findByServicoIdOrderByEnviadoEmAsc(servicoId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private MenssengerResponse toResponse(Menssenger m) {
        MenssengerResponse r = new MenssengerResponse();
        r.setId(m.getId());
        r.setServicoId(m.getServico().getId());
        r.setConteudo(m.getConteudo());
        r.setEnviadoEm(m.getEnviadoEm());

        // Linhas antigas têm remetenteTipo null — tratar como PROFISSIONAL
        boolean ehCliente = "CLIENTE".equals(m.getRemetenteTipo());

        if (ehCliente && m.getRemetenteUsuario() != null) {
            r.setRemetenteId(m.getRemetenteUsuario().getId());
            r.setRemetenteNome(m.getRemetenteUsuario().getNome());
            r.setRemetenteTipo("CLIENTE");
            dto.setDestinatarioId(servico.getProfissional().getId());
        } else if (m.getRemetente() != null) {
            r.setRemetenteId(m.getRemetente().getId());
            r.setRemetenteNome(m.getRemetente().getNome());
            r.setRemetenteTipo("PROFISSIONAL");
            dto.setDestinatarioId(servico.getCliente().getId());
        }

        return r;
    }
}