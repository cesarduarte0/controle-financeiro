package com.financeiro.dto;

import com.financeiro.model.Meta;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

public record MetaResponse(
        Long id,
        String nome,
        BigDecimal valorAlvo,
        BigDecimal valorAtual,
        BigDecimal valorFaltante,
        BigDecimal percentual,
        LocalDate prazo,
        boolean concluida
) {

    public static MetaResponse de(Meta m) {
        BigDecimal faltante = m.getValorAlvo().subtract(m.getValorAtual());
        if (faltante.signum() < 0) {
            faltante = BigDecimal.ZERO;
        }

        BigDecimal percentual = m.getValorAtual()
                .multiply(BigDecimal.valueOf(100))
                .divide(m.getValorAlvo(), 2, RoundingMode.HALF_UP);
        if (percentual.compareTo(BigDecimal.valueOf(100)) > 0) {
            percentual = BigDecimal.valueOf(100).setScale(2);
        }

        boolean concluida = m.getValorAtual().compareTo(m.getValorAlvo()) >= 0;

        return new MetaResponse(m.getId(), m.getNome(), m.getValorAlvo(), m.getValorAtual(),
                faltante, percentual, m.getPrazo(), concluida);
    }
}
