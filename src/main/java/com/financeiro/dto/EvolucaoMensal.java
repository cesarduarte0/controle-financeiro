package com.financeiro.dto;

import java.math.BigDecimal;

public record EvolucaoMensal(
        int mes,
        BigDecimal receitas,
        BigDecimal despesas,
        BigDecimal saldo
) {
}
