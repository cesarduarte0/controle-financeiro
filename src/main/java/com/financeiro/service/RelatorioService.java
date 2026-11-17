package com.financeiro.service;

import com.financeiro.dto.EvolucaoMensal;
import com.financeiro.dto.GastoPorCategoria;
import com.financeiro.dto.ResumoMensal;
import com.financeiro.dto.SaldoResponse;
import com.financeiro.exception.RegraNegocioException;
import com.financeiro.model.TipoTransacao;
import com.financeiro.model.Transacao;
import com.financeiro.repository.TransacaoRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class RelatorioService {

    private final TransacaoRepository transacaoRepository;

    public RelatorioService(TransacaoRepository transacaoRepository) {
        this.transacaoRepository = transacaoRepository;
    }

    // Saldo geral: tudo que já entrou menos tudo que já saiu
    public SaldoResponse saldo() {
        BigDecimal receitas = semNulo(transacaoRepository.somarPorTipo(TipoTransacao.RECEITA));
        BigDecimal despesas = semNulo(transacaoRepository.somarPorTipo(TipoTransacao.DESPESA));
        return new SaldoResponse(receitas, despesas, receitas.subtract(despesas));
    }

    public ResumoMensal resumoMensal(int ano, int mes) {
        if (mes < 1 || mes > 12) {
            throw new RegraNegocioException("O mês deve estar entre 1 e 12");
        }

        YearMonth periodo = YearMonth.of(ano, mes);
        LocalDate inicio = periodo.atDay(1);
        LocalDate fim = periodo.atEndOfMonth();

        BigDecimal receitas = semNulo(
                transacaoRepository.somarPorTipoNoPeriodo(TipoTransacao.RECEITA, inicio, fim));
        BigDecimal despesas = semNulo(
                transacaoRepository.somarPorTipoNoPeriodo(TipoTransacao.DESPESA, inicio, fim));
        List<GastoPorCategoria> porCategoria =
                transacaoRepository.somarPorCategoria(TipoTransacao.DESPESA, inicio, fim);

        return new ResumoMensal(ano, mes, receitas, despesas, receitas.subtract(despesas), porCategoria);
    }

    // Um item por mês (1 a 12) com receitas, despesas e saldo
    public List<EvolucaoMensal> evolucaoAnual(int ano) {
        List<EvolucaoMensal> meses = new ArrayList<>();

        for (int mes = 1; mes <= 12; mes++) {
            YearMonth periodo = YearMonth.of(ano, mes);
            LocalDate inicio = periodo.atDay(1);
            LocalDate fim = periodo.atEndOfMonth();

            BigDecimal receitas = semNulo(
                    transacaoRepository.somarPorTipoNoPeriodo(TipoTransacao.RECEITA, inicio, fim));
            BigDecimal despesas = semNulo(
                    transacaoRepository.somarPorTipoNoPeriodo(TipoTransacao.DESPESA, inicio, fim));

            meses.add(new EvolucaoMensal(mes, receitas, despesas, receitas.subtract(despesas)));
        }

        return meses;
    }

    // Extrato em CSV (separador ; para abrir direto no Excel em pt-BR)
    public String extratoCsv(LocalDate inicio, LocalDate fim) {
        List<Transacao> transacoes =
                transacaoRepository.findByDataBetweenOrderByDataDescIdDesc(inicio, fim);

        StringBuilder csv = new StringBuilder("﻿");
        csv.append("id;tipo;descricao;valor;data;categoria\n");

        for (Transacao t : transacoes) {
            csv.append(t.getId()).append(';')
                    .append(t.getTipo()).append(';')
                    .append(t.getDescricao().replace(';', ',')).append(';')
                    .append(t.getValor()).append(';')
                    .append(t.getData()).append(';')
                    .append(t.getCategoria().getNome().replace(';', ','))
                    .append('\n');
        }

        return csv.toString();
    }

    private BigDecimal semNulo(BigDecimal valor) {
        return valor == null ? BigDecimal.ZERO : valor;
    }
}
