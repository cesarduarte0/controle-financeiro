package com.financeiro.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record MetaRequest(
        @NotBlank(message = "O nome da meta é obrigatório")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
        String nome,

        @NotNull(message = "O valor alvo é obrigatório")
        @DecimalMin(value = "0.01", message = "O valor alvo deve ser maior que zero")
        BigDecimal valorAlvo,

        LocalDate prazo
) {
}
