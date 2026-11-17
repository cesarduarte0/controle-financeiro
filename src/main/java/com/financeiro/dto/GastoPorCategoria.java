package com.financeiro.dto;

import java.math.BigDecimal;

public record GastoPorCategoria(
        String categoria,
        BigDecimal total
) {
}
