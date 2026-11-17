package com.financeiro.dto;

import com.financeiro.model.TipoTransacao;
import com.financeiro.model.Transacao;
import java.math.BigDecimal;
import java.time.LocalDate;

public record TransacaoResponse(
        Long id,
        TipoTransacao tipo,
        String descricao,
        BigDecimal valor,
        LocalDate data,
        Long categoriaId,
        String categoriaNome
) {

    public static TransacaoResponse de(Transacao t) {
        return new TransacaoResponse(
                t.getId(),
                t.getTipo(),
                t.getDescricao(),
                t.getValor(),
                t.getData(),
                t.getCategoria().getId(),
                t.getCategoria().getNome());
    }
}
