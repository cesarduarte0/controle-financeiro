package com.financeiro.controller;

import com.financeiro.dto.EvolucaoMensal;
import com.financeiro.dto.ResumoMensal;
import com.financeiro.dto.SaldoResponse;
import com.financeiro.service.RelatorioService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @GetMapping("/saldo")
    public SaldoResponse saldo() {
        return relatorioService.saldo();
    }

    // Ex: GET /api/relatorios/mensal?ano=2026&mes=11
    @GetMapping("/mensal")
    public ResumoMensal mensal(@RequestParam int ano, @RequestParam int mes) {
        return relatorioService.resumoMensal(ano, mes);
    }

    // Ex: GET /api/relatorios/anual?ano=2026
    @GetMapping("/anual")
    public List<EvolucaoMensal> anual(@RequestParam int ano) {
        return relatorioService.evolucaoAnual(ano);
    }

    // Ex: GET /api/relatorios/extrato.csv?inicio=2026-11-01&fim=2026-11-30
    @GetMapping("/extrato.csv")
    public ResponseEntity<String> extratoCsv(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {

        String csv = relatorioService.extratoCsv(inicio, fim);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=extrato.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }
}
