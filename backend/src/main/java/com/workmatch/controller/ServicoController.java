package com.workmatch.controller;

    import com.workmatch.dto.ConfirmarCodigoDTO;
    import com.workmatch.dto.ServicoDTO;
    import com.workmatch.dto.response.CandidatureResponse;
    import com.workmatch.dto.response.CodigoGeradoResponse;
    import com.workmatch.dto.response.PageResponse;
    import com.workmatch.dto.response.ServicoResponse;
    import com.workmatch.model.StatusServico;
    import com.workmatch.service.ServicoService;
    import jakarta.validation.Valid;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;
    import java.util.UUID;

    @RestController
    @RequestMapping("/api/servicos")
    public class ServicoController {

        private final ServicoService service;

        public ServicoController(ServicoService service) {
            this.service = service;
        }

        @PostMapping
        public ResponseEntity<ServicoResponse> criar(@RequestBody @Valid ServicoDTO dto) {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ServicoResponse> buscarPorId(@PathVariable UUID id) {
            return ResponseEntity.ok(service.buscarPorId(id));
        }

        @GetMapping("/publicados")
        public ResponseEntity<PageResponse<ServicoResponse>> listarPublicados(
                @RequestParam(required = false) String especialidade,
                @RequestParam(required = false) String cidade,
                @RequestParam(defaultValue = "0")  int page,
                @RequestParam(defaultValue = "20") int size) {
            return ResponseEntity.ok(service.listarPublicados(especialidade, cidade, page, size));
        }

        @GetMapping("/cliente/{clienteId}")
        public ResponseEntity<List<ServicoResponse>> listarPorCliente(
                @PathVariable UUID clienteId,
                @RequestParam(required = false) StatusServico status) {
            return ResponseEntity.ok(service.listarPorCliente(clienteId, status));
        }

        @GetMapping("/profissional/{profissionalId}")
        public ResponseEntity<List<ServicoResponse>> listarPorProfissional(
                @PathVariable UUID profissionalId,
                @RequestParam(required = false) StatusServico status) {
            return ResponseEntity.ok(service.listarPorProfissional(profissionalId, status));
        }

        @PatchMapping("/{id}/avancar")
        public ResponseEntity<ServicoResponse> avancarStatus(
                @PathVariable UUID id,
                @RequestParam(required = false) UUID profissionalId) {
            return ResponseEntity.ok(service.avancarStatus(id, profissionalId));
        }

        // Cliente: gera o código de início de serviço (status permanece CONTRATADO)
        @PostMapping("/{id}/iniciar-codigo")
        public ResponseEntity<CodigoGeradoResponse> iniciarCodigo(
                @PathVariable UUID id,
                @RequestParam UUID clienteId) {
            String codigo = service.gerarCodigoInicio(id, clienteId);
            return ResponseEntity.ok(new CodigoGeradoResponse(codigo));
        }

        // Profissional: confere o código; se correto, o status avança para ANDAMENTO
        @PostMapping("/{id}/confirmar-codigo")
        public ResponseEntity<ServicoResponse> confirmarCodigo(
                @PathVariable UUID id,
                @RequestParam UUID profissionalId,
                @RequestBody @Valid ConfirmarCodigoDTO dto) {
            return ResponseEntity.ok(service.confirmarCodigoInicio(id, profissionalId, dto.codigo()));
        }

        // Cliente: gera o código de finalização de serviço (status permanece ANDAMENTO)
        @PostMapping("/{id}/finalizar-codigo")
        public ResponseEntity<CodigoGeradoResponse> finalizarCodigo(
                @PathVariable UUID id,
                @RequestParam UUID clienteId) {
            String codigo = service.gerarCodigoFinalizacao(id, clienteId);
            return ResponseEntity.ok(new CodigoGeradoResponse(codigo));
        }

        // Profissional: confere o código; se correto, o status avança para FINALIZADO
        @PostMapping("/{id}/confirmar-codigo-finalizacao")
        public ResponseEntity<ServicoResponse> confirmarCodigoFinalizacao(
                @PathVariable UUID id,
                @RequestParam UUID profissionalId,
                @RequestBody @Valid ConfirmarCodigoDTO dto) {
            return ResponseEntity.ok(service.confirmarCodigoFinalizacao(id, profissionalId, dto.codigo()));
        }

        @PatchMapping("/{id}/arquivar")
        public ResponseEntity<ServicoResponse> arquivar(@PathVariable UUID id) {
            return ResponseEntity.ok(service.arquivar(id));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> cancelar(@PathVariable UUID id) {
            service.cancelar(id);
            return ResponseEntity.noContent().build();
        }

        @GetMapping("/servico/{servicoId}")
        public ResponseEntity<List<CandidatureResponse>> listarCandidaturas(
                @PathVariable UUID servicoId) {
            return ResponseEntity.ok(service.listarPorServico(servicoId));
        }
    }