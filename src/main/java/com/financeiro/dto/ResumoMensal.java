package com.financeiro.dto;

import java.math.BigDecimal;
import java.util.List;

public record ResumoMensal(
        int ano,
        int mes,
        BigDecimal receitas,
        BigDecimal despesas,
        BigDecimal saldo,
        List<GastoPorCategoria> despesasPorCategoria
) {
}
