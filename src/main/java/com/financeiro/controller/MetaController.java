package com.financeiro.controller;

import com.financeiro.dto.MetaRequest;
import com.financeiro.dto.MetaResponse;
import com.financeiro.dto.ValorRequest;
import com.financeiro.service.MetaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/metas")
public class MetaController {

    private final MetaService metaService;

    public MetaController(MetaService metaService) {
        this.metaService = metaService;
    }

    @GetMapping
    public List<MetaResponse> listar() {
        return metaService.listar();
    }

    @GetMapping("/{id}")
    public MetaResponse buscar(@PathVariable Long id) {
        return metaService.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MetaResponse criar(@Valid @RequestBody MetaRequest req) {
        return metaService.criar(req);
    }

    @PutMapping("/{id}")
    public MetaResponse atualizar(@PathVariable Long id, @Valid @RequestBody MetaRequest req) {
        return metaService.atualizar(id, req);
    }

    @PostMapping("/{id}/depositos")
    public MetaResponse depositar(@PathVariable Long id, @Valid @RequestBody ValorRequest req) {
        return metaService.depositar(id, req.valor());
    }

    @PostMapping("/{id}/retiradas")
    public MetaResponse retirar(@PathVariable Long id, @Valid @RequestBody ValorRequest req) {
        return metaService.retirar(id, req.valor());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        metaService.excluir(id);
    }
}
