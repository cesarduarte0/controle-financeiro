package com.financeiro.repository;

import com.financeiro.dto.GastoPorCategoria;
import com.financeiro.model.TipoTransacao;
import com.financeiro.model.Transacao;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    List<Transacao> findByDataBetweenOrderByDataDescIdDesc(LocalDate inicio, LocalDate fim);

    List<Transacao> findByTipoAndDataBetweenOrderByDataDescIdDesc(TipoTransacao tipo,
                                                                  LocalDate inicio, LocalDate fim);

    boolean existsByCategoriaId(Long categoriaId);

    // Retornam null quando não há nenhuma transação (tratado no service)
    @Query("select sum(t.valor) from Transacao t where t.tipo = :tipo")
    BigDecimal somarPorTipo(@Param("tipo") TipoTransacao tipo);

    @Query("select sum(t.valor) from Transacao t "
            + "where t.tipo = :tipo and t.data between :inicio and :fim")
    BigDecimal somarPorTipoNoPeriodo(@Param("tipo") TipoTransacao tipo,
                                     @Param("inicio") LocalDate inicio,
                                     @Param("fim") LocalDate fim);

    @Query("select new com.financeiro.dto.GastoPorCategoria(t.categoria.nome, sum(t.valor)) "
            + "from Transacao t "
            + "where t.tipo = :tipo and t.data between :inicio and :fim "
            + "group by t.categoria.nome "
            + "order by sum(t.valor) desc")
    List<GastoPorCategoria> somarPorCategoria(@Param("tipo") TipoTransacao tipo,
                                              @Param("inicio") LocalDate inicio,
                                              @Param("fim") LocalDate fim);
}
