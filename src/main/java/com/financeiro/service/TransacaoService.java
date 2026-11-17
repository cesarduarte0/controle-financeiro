package com.financeiro.service;

import com.financeiro.dto.TransacaoRequest;
import com.financeiro.dto.TransacaoResponse;
import com.financeiro.exception.RecursoNaoEncontradoException;
import com.financeiro.model.Categoria;
import com.financeiro.model.TipoTransacao;
import com.financeiro.model.Transacao;
import com.financeiro.repository.TransacaoRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransacaoService {

    private final TransacaoRepository transacaoRepository;
    private final CategoriaService categoriaService;

    public TransacaoService(TransacaoRepository transacaoRepository,
                            CategoriaService categoriaService) {
        this.transacaoRepository = transacaoRepository;
        this.categoriaService = categoriaService;
    }

    // Se não informar período, usa o mês atual
    public List<TransacaoResponse> listar(TipoTransacao tipo, LocalDate inicio, LocalDate fim) {
        if (inicio == null) {
            inicio = LocalDate.now().withDayOfMonth(1);
        }
        if (fim == null) {
            fim = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        }

        List<Transacao> transacoes;
        if (tipo == null) {
            transacoes = transacaoRepository.findByDataBetweenOrderByDataDescIdDesc(inicio, fim);
        } else {
            transacoes = transacaoRepository
                    .findByTipoAndDataBetweenOrderByDataDescIdDesc(tipo, inicio, fim);
        }

        return transacoes.stream().map(TransacaoResponse::de).toList();
    }

    public TransacaoResponse buscar(Long id) {
        return TransacaoResponse.de(buscarEntidade(id));
    }

    @Transactional
    public TransacaoResponse criar(TransacaoRequest req) {
        Transacao transacao = new Transacao();
        preencher(transacao, req);
        return TransacaoResponse.de(transacaoRepository.save(transacao));
    }

    @Transactional
    public TransacaoResponse atualizar(Long id, TransacaoRequest req) {
        Transacao transacao = buscarEntidade(id);
        preencher(transacao, req);
        return TransacaoResponse.de(transacaoRepository.save(transacao));
    }

    @Transactional
    public void excluir(Long id) {
        transacaoRepository.delete(buscarEntidade(id));
    }

    private Transacao buscarEntidade(Long id) {
        return transacaoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Transação " + id + " não encontrada"));
    }

    private void preencher(Transacao transacao, TransacaoRequest req) {
        Categoria categoria = categoriaService.buscar(req.categoriaId());
        transacao.setTipo(req.tipo());
        transacao.setDescricao(req.descricao().trim());
        transacao.setValor(req.valor());
        transacao.setData(req.data());
        transacao.setCategoria(categoria);
    }
}
