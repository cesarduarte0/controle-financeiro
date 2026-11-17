package com.financeiro.service;

import com.financeiro.dto.MetaRequest;
import com.financeiro.dto.MetaResponse;
import com.financeiro.exception.RecursoNaoEncontradoException;
import com.financeiro.exception.RegraNegocioException;
import com.financeiro.model.Meta;
import com.financeiro.repository.MetaRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MetaService {

    private final MetaRepository metaRepository;

    public MetaService(MetaRepository metaRepository) {
        this.metaRepository = metaRepository;
    }

    public List<MetaResponse> listar() {
        return metaRepository.findAll().stream().map(MetaResponse::de).toList();
    }

    public MetaResponse buscar(Long id) {
        return MetaResponse.de(buscarEntidade(id));
    }

    @Transactional
    public MetaResponse criar(MetaRequest req) {
        Meta meta = new Meta();
        meta.setNome(req.nome().trim());
        meta.setValorAlvo(req.valorAlvo());
        meta.setPrazo(req.prazo());
        return MetaResponse.de(metaRepository.save(meta));
    }

    @Transactional
    public MetaResponse atualizar(Long id, MetaRequest req) {
        Meta meta = buscarEntidade(id);
        meta.setNome(req.nome().trim());
        meta.setValorAlvo(req.valorAlvo());
        meta.setPrazo(req.prazo());
        return MetaResponse.de(metaRepository.save(meta));
    }

    @Transactional
    public MetaResponse depositar(Long id, BigDecimal valor) {
        Meta meta = buscarEntidade(id);
        meta.setValorAtual(meta.getValorAtual().add(valor));
        return MetaResponse.de(metaRepository.save(meta));
    }

    @Transactional
    public MetaResponse retirar(Long id, BigDecimal valor) {
        Meta meta = buscarEntidade(id);
        if (valor.compareTo(meta.getValorAtual()) > 0) {
            throw new RegraNegocioException("Valor maior que o acumulado na meta ("
                    + meta.getValorAtual() + ")");
        }
        meta.setValorAtual(meta.getValorAtual().subtract(valor));
        return MetaResponse.de(metaRepository.save(meta));
    }

    @Transactional
    public void excluir(Long id) {
        metaRepository.delete(buscarEntidade(id));
    }

    private Meta buscarEntidade(Long id) {
        return metaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Meta " + id + " não encontrada"));
    }
}
