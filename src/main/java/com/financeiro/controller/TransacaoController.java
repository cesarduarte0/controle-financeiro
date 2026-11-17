package com.financeiro.controller;

import com.financeiro.dto.TransacaoRequest;
import com.financeiro.dto.TransacaoResponse;
import com.financeiro.model.TipoTransacao;
import com.financeiro.service.TransacaoService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transacoes")
public class TransacaoController {

    private final TransacaoService transacaoService;

    public TransacaoController(TransacaoService transacaoService) {
        this.transacaoService = transacaoService;
    }

    // Ex: GET /api/transacoes?tipo=DESPESA&inicio=2026-11-01&fim=2026-11-30
    @GetMapping
    public List<TransacaoResponse> listar(
            @RequestParam(required = false) TipoTransacao tipo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return transacaoService.listar(tipo, inicio, fim);
    }

    @GetMapping("/{id}")
    public TransacaoResponse buscar(@PathVariable Long id) {
        return transacaoService.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransacaoResponse criar(@Valid @RequestBody TransacaoRequest req) {
        return transacaoService.criar(req);
    }

    @PutMapping("/{id}")
    public TransacaoResponse atualizar(@PathVariable Long id, @Valid @RequestBody TransacaoRequest req) {
        return transacaoService.atualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        transacaoService.excluir(id);
    }
}
