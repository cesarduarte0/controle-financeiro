package com.financeiro.service;

import com.financeiro.exception.RecursoNaoEncontradoException;
import com.financeiro.exception.RegraNegocioException;
import com.financeiro.model.Categoria;
import com.financeiro.repository.CategoriaRepository;
import com.financeiro.repository.TransacaoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final TransacaoRepository transacaoRepository;

    public CategoriaService(CategoriaRepository categoriaRepository,
                            TransacaoRepository transacaoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.transacaoRepository = transacaoRepository;
    }

    public List<Categoria> listar() {
        return categoriaRepository.findAllByOrderByNomeAsc();
    }

    public Categoria buscar(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria " + id + " não encontrada"));
    }

    @Transactional
    public Categoria criar(Categoria categoria) {
        String nome = categoria.getNome().trim();
        if (categoriaRepository.existsByNomeIgnoreCase(nome)) {
            throw new RegraNegocioException("Já existe uma categoria chamada \"" + nome + "\"");
        }
        categoria.setId(null);
        categoria.setNome(nome);
        return categoriaRepository.save(categoria);
    }

    @Transactional
    public Categoria atualizar(Long id, Categoria dados) {
        Categoria categoria = buscar(id);
        String nome = dados.getNome().trim();

        boolean mudouNome = !categoria.getNome().equalsIgnoreCase(nome);
        if (mudouNome && categoriaRepository.existsByNomeIgnoreCase(nome)) {
            throw new RegraNegocioException("Já existe uma categoria chamada \"" + nome + "\"");
        }

        categoria.setNome(nome);
        return categoriaRepository.save(categoria);
    }

    @Transactional
    public void excluir(Long id) {
        Categoria categoria = buscar(id);
        if (transacaoRepository.existsByCategoriaId(id)) {
            throw new RegraNegocioException(
                    "Não é possível excluir: existem transações usando esta categoria");
        }
        categoriaRepository.delete(categoria);
    }
}
