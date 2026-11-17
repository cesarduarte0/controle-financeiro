/*
 * Controle Financeiro - front-end
 * HTML + CSS + JavaScript puro, conversando com a API do Spring Boot (/api)
 */

// ===================== Configuração =====================

const API = '/api';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const CORES = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#ec4899', '#6366f1'];
const CATEGORIAS_PADRAO = ['Salário', 'Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Outros'];

const pagina = document.getElementById('pagina');
const hoje = new Date();

// Estado da aplicação: mês que está sendo exibido e lista de categorias
const estado = {
    ano: hoje.getFullYear(),
    mes: hoje.getMonth() + 1,
    categorias: []
};

// Filtro da tela de transações (começa no mês atual)
const filtroTransacoes = {
    tipo: '',
    inicio: inicioDoMes(estado.ano, estado.mes),
    fim: fimDoMes(estado.ano, estado.mes)
};

// ===================== Funções de apoio =====================

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function moeda(valor) {
    return formatadorMoeda.format(valor || 0);
}

function porcentagem(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

// Protege contra HTML dentro dos textos digitados pelo usuário
function esc(texto) {
    const trocas = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(texto ?? '').replace(/[&<>"']/g, letra => trocas[letra]);
}

function pad(n) {
    return String(n).padStart(2, '0');
}

// "2026-11-15" -> "15/11/2026"
function dataBR(iso) {
    if (!iso) return '—';
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
}

function inicioDoMes(ano, mes) {
    return `${ano}-${pad(mes)}-01`;
}

function fimDoMes(ano, mes) {
    return `${ano}-${pad(mes)}-${pad(new Date(ano, mes, 0).getDate())}`;
}

function hojeISO() {
    const h = new Date();
    return `${h.getFullYear()}-${pad(h.getMonth() + 1)}-${pad(h.getDate())}`;
}

// Chamada para a API. Se der erro, lança uma exceção com a mensagem do servidor.
async function api(url, opcoes = {}) {
    const resposta = await fetch(API + url, {
        headers: { 'Content-Type': 'application/json' },
        ...opcoes
    });

    if (!resposta.ok) {
        let mensagem = 'Erro ' + resposta.status;
        try {
            const corpo = await resposta.json();
            if (corpo.erro) mensagem = corpo.erro;
        } catch (e) {
            // resposta sem JSON, mantém a mensagem padrão
        }
        throw new Error(mensagem);
    }

    if (resposta.status === 204) return null;
    return resposta.json();
}

function enviar(metodo, dados) {
    return { method: metodo, body: JSON.stringify(dados) };
}

async function carregarCategorias() {
    estado.categorias = await api('/categorias');
    return estado.categorias;
}

function aviso(mensagem, tipo = 'ok') {
    const caixa = document.createElement('div');
    caixa.className = 'aviso ' + (tipo === 'erro' ? 'erro' : '');
    caixa.textContent = mensagem;
    document.getElementById('avisos').appendChild(caixa);
    setTimeout(() => caixa.remove(), 4000);
}

// ===================== Ícones =====================

const ICONES = {
    dashboard: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    transacoes: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    categorias: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    metas: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    relatorios: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    mais: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    editar: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    lixeira: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    baixar: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    esquerda: '<polyline points="15 18 9 12 15 6"/>',
    direita: '<polyline points="9 18 15 12 9 6"/>',
    subindo: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    descendo: '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>',
    carteira: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    porcentagem: '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>'
};

function icone(nome) {
    return `<svg class="icone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[nome] || ''}</svg>`;
}

// ===================== Pedaços de HTML reutilizados =====================

function cabecalho(titulo, subtitulo, acoes = '') {
    return `<header class="pagina-topo">
        <div><h1>${titulo}</h1><p>${subtitulo}</p></div>
        <div class="topo-acoes">${acoes}</div>
    </header>`;
}

function vazio(mensagem) {
    return `<p class="vazio">${mensagem}</p>`;
}

function cartao(titulo, valor, nomeIcone, cor) {
    return `<div class="cartao">
        <div class="cartao-icone ${cor}">${icone(nomeIcone)}</div>
        <div><span class="cartao-titulo">${titulo}</span><strong class="cartao-valor">${valor}</strong></div>
    </div>`;
}

function seletorMes() {
    return `<div class="seletor-mes">
        <button class="btn-icone" data-mes="-1" aria-label="Mês anterior">${icone('esquerda')}</button>
        <span>${MESES[estado.mes - 1]} ${estado.ano}</span>
        <button class="btn-icone" data-mes="1" aria-label="Próximo mês">${icone('direita')}</button>
    </div>`;
}

function ligarSeletorMes() {
    document.querySelectorAll('[data-mes]').forEach(botao => {
        botao.addEventListener('click', () => {
            estado.mes += Number(botao.dataset.mes);
            if (estado.mes < 1) { estado.mes = 12; estado.ano--; }
            if (estado.mes > 12) { estado.mes = 1; estado.ano++; }
            navegar(false);
        });
    });
}

function htmlDespesasPorCategoria(lista) {
    if (!lista || lista.length === 0) return vazio('Nenhuma despesa neste mês.');

    const soma = lista.reduce((total, item) => total + item.total, 0);

    const itens = lista.map((item, i) => {
        const pct = soma > 0 ? (item.total / soma) * 100 : 0;
        const cor = CORES[i % CORES.length];
        return `<li>
            <div class="linha-cat">
                <span class="ponto" style="background:${cor}"></span>
                <span class="nome">${esc(item.categoria)}</span>
                <span class="valor">${moeda(item.total)}</span>
                <span class="pct">${pct.toFixed(0)}%</span>
            </div>
            <div class="barra fina"><div class="barra-preenchida" style="width:${pct}%;background:${cor}"></div></div>
        </li>`;
    });

    return `<ul class="categorias-lista">${itens.join('')}</ul>`;
}

function htmlGraficoAnual(dados) {
    const maximo = Math.max(1, ...dados.flatMap(d => [d.receitas, d.despesas]));

    const colunas = dados.map(d => {
        const alturaReceita = (d.receitas / maximo) * 100;
        const alturaDespesa = (d.despesas / maximo) * 100;
        const dica = `${MESES[d.mes - 1]}: receitas ${moeda(d.receitas)} | despesas ${moeda(d.despesas)}`;
        return `<div class="coluna" title="${dica}">
            <div class="barras">
                <div class="b receita" style="height:${alturaReceita}%"></div>
                <div class="b despesa" style="height:${alturaDespesa}%"></div>
            </div>
            <span>${MESES_CURTOS[d.mes - 1]}</span>
        </div>`;
    });

    return `<div class="grafico">${colunas.join('')}</div>
        <div class="legenda">
            <div><i style="background:var(--receita)"></i>Receitas</div>
            <div><i style="background:var(--despesa)"></i>Despesas</div>
        </div>`;
}

function htmlListaTransacoes(lista) {
    if (lista.length === 0) return vazio('Nenhuma transação neste mês.');

    const itens = lista.map(t => {
        const receita = t.tipo === 'RECEITA';
        return `<li>
            <span class="icone-tipo ${receita ? 'verde' : 'vermelho'}">${icone(receita ? 'subindo' : 'descendo')}</span>
            <div class="info">
                <strong>${esc(t.descricao)}</strong>
                <small>${esc(t.categoriaNome)} · ${dataBR(t.data)}</small>
            </div>
            <span class="valor ${receita ? 'positivo' : 'negativo'}">${receita ? '+' : '−'} ${moeda(t.valor)}</span>
        </li>`;
    });

    return `<ul class="lista-transacoes">${itens.join('')}</ul>`;
}

function htmlMetasResumo(metas) {
    if (metas.length === 0) return vazio('Você ainda não criou nenhuma meta.');

    return metas.slice(0, 3).map(m => `<div class="meta-mini">
        <div class="linha-cat">
            <span class="nome">${esc(m.nome)}</span>
            <span class="pct">${porcentagem(m.percentual)}%</span>
        </div>
        <div class="barra"><div class="barra-preenchida" style="width:${Math.min(100, m.percentual)}%"></div></div>
        <small>${moeda(m.valorAtual)} de ${moeda(m.valorAlvo)}</small>
    </div>`).join('');
}

// ===================== Janela (modal) =====================

function abrirModal(tituloHtml, corpoHtml, aoEnviar, textoBotao = 'Salvar') {
    const modal = document.getElementById('modal');

    modal.innerHTML = `<form>
        <h3>${tituloHtml}</h3>
        <div>${corpoHtml}</div>
        <div class="modal-acoes">
            <button type="button" class="btn btn-neutro" id="modal-cancelar">Cancelar</button>
            <button type="submit" class="btn btn-primario">${textoBotao}</button>
        </div>
    </form>`;

    const form = modal.querySelector('form');

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const dados = Object.fromEntries(new FormData(form));
        try {
            await aoEnviar(dados);
            modal.close();
        } catch (erro) {
            aviso(erro.message, 'erro');
        }
    });

    modal.querySelector('#modal-cancelar').addEventListener('click', () => modal.close());
    modal.showModal();
}

// ===================== Páginas =====================

// ---------- Dashboard ----------
async function renderDashboard(valido) {
    const [saldo, mensal, anual, transacoes, metas] = await Promise.all([
        api('/relatorios/saldo'),
        api(`/relatorios/mensal?ano=${estado.ano}&mes=${estado.mes}`),
        api(`/relatorios/anual?ano=${estado.ano}`),
        api(`/transacoes?inicio=${inicioDoMes(estado.ano, estado.mes)}&fim=${fimDoMes(estado.ano, estado.mes)}`),
        api('/metas')
    ]);
    if (!valido()) return;

    const botaoNova = `<button class="btn btn-primario" id="btn-nova">${icone('mais')} Nova transação</button>`;

    pagina.innerHTML = `
        ${cabecalho('Dashboard', 'Visão geral das suas finanças', seletorMes() + botaoNova)}

        <section class="cartoes">
            ${cartao('Saldo geral', moeda(saldo.saldo), 'carteira', saldo.saldo >= 0 ? 'azul' : 'vermelho')}
            ${cartao('Receitas do mês', moeda(mensal.receitas), 'subindo', 'verde')}
            ${cartao('Despesas do mês', moeda(mensal.despesas), 'descendo', 'vermelho')}
            ${cartao('Saldo do mês', moeda(mensal.saldo), 'carteira', mensal.saldo >= 0 ? 'verde' : 'vermelho')}
        </section>

        <section class="grade-2">
            <div class="painel">
                <h3>Despesas por categoria</h3>
                ${htmlDespesasPorCategoria(mensal.despesasPorCategoria)}
            </div>
            <div class="painel">
                <h3>Evolução em ${estado.ano}</h3>
                ${htmlGraficoAnual(anual)}
            </div>
        </section>

        <section class="grade-2">
            <div class="painel">
                <div class="painel-topo"><h3>Últimas transações</h3><a href="#transacoes" class="link">Ver todas</a></div>
                ${htmlListaTransacoes(transacoes.slice(0, 6))}
            </div>
            <div class="painel">
                <div class="painel-topo"><h3>Metas</h3><a href="#metas" class="link">Ver todas</a></div>
                ${htmlMetasResumo(metas)}
            </div>
        </section>`;

    ligarSeletorMes();
    document.getElementById('btn-nova').addEventListener('click', () => abrirModalTransacao());
}

// ---------- Transações ----------
async function renderTransacoes(valido) {
    const f = filtroTransacoes;
    let url = `/transacoes?inicio=${f.inicio}&fim=${f.fim}`;
    if (f.tipo) url += `&tipo=${f.tipo}`;

    const [lista] = await Promise.all([api(url), carregarCategorias()]);
    if (!valido()) return;

    const totalReceitas = lista.filter(t => t.tipo === 'RECEITA').reduce((s, t) => s + t.valor, 0);
    const totalDespesas = lista.filter(t => t.tipo === 'DESPESA').reduce((s, t) => s + t.valor, 0);

    const linhas = lista.map(t => {
        const receita = t.tipo === 'RECEITA';
        return `<tr>
            <td>${dataBR(t.data)}</td>
            <td>${esc(t.descricao)}</td>
            <td><span class="etiqueta">${esc(t.categoriaNome)}</span></td>
            <td class="valor ${receita ? 'positivo' : 'negativo'}">${receita ? '+' : '−'} ${moeda(t.valor)}</td>
            <td class="acoes">
                <button class="btn-icone" data-editar="${t.id}" title="Editar">${icone('editar')}</button>
                <button class="btn-icone perigo" data-excluir="${t.id}" title="Excluir">${icone('lixeira')}</button>
            </td>
        </tr>`;
    }).join('');

    const tabela = lista.length === 0
        ? vazio('Nenhuma transação encontrada neste período.')
        : `<div class="tabela-wrap"><table>
            <thead><tr>
                <th>Data</th><th>Descrição</th><th>Categoria</th><th class="direita">Valor</th><th></th>
            </tr></thead>
            <tbody>${linhas}</tbody>
        </table></div>`;

    pagina.innerHTML = `
        ${cabecalho('Transações', 'Suas receitas e despesas',
            `<button class="btn btn-primario" id="btn-nova">${icone('mais')} Nova transação</button>`)}

        <div class="painel">
            <div class="filtros">
                <div class="campo">
                    <label for="filtro-tipo">Tipo</label>
                    <select id="filtro-tipo">
                        <option value="">Todos</option>
                        <option value="RECEITA" ${f.tipo === 'RECEITA' ? 'selected' : ''}>Receitas</option>
                        <option value="DESPESA" ${f.tipo === 'DESPESA' ? 'selected' : ''}>Despesas</option>
                    </select>
                </div>
                <div class="campo">
                    <label for="filtro-inicio">De</label>
                    <input type="date" id="filtro-inicio" value="${f.inicio}">
                </div>
                <div class="campo">
                    <label for="filtro-fim">Até</label>
                    <input type="date" id="filtro-fim" value="${f.fim}">
                </div>
                <div class="resumo-filtro">
                    <div><span>Receitas</span><br><strong class="positivo">${moeda(totalReceitas)}</strong></div>
                    <div><span>Despesas</span><br><strong class="negativo">${moeda(totalDespesas)}</strong></div>
                </div>
            </div>
            ${tabela}
        </div>`;

    document.getElementById('btn-nova').addEventListener('click', () => abrirModalTransacao());

    document.getElementById('filtro-tipo').addEventListener('change', e => {
        f.tipo = e.target.value;
        navegar(false);
    });

    // Só atualiza se a data for válida (campo não vazio)
    document.getElementById('filtro-inicio').addEventListener('change', e => {
        if (e.target.value) { f.inicio = e.target.value; navegar(false); }
    });
    document.getElementById('filtro-fim').addEventListener('change', e => {
        if (e.target.value) { f.fim = e.target.value; navegar(false); }
    });

    pagina.querySelectorAll('[data-editar]').forEach(botao => {
        botao.addEventListener('click', () => {
            const t = lista.find(item => item.id === Number(botao.dataset.editar));
            abrirModalTransacao(t);
        });
    });

    pagina.querySelectorAll('[data-excluir]').forEach(botao => {
        botao.addEventListener('click', async () => {
            if (!confirm('Excluir esta transação?')) return;
            try {
                await api(`/transacoes/${botao.dataset.excluir}`, { method: 'DELETE' });
                aviso('Transação excluída.');
                navegar(false);
            } catch (erro) {
                aviso(erro.message, 'erro');
            }
        });
    });
}

function abrirModalTransacao(t) {
    if (estado.categorias.length === 0) {
        aviso('Cadastre uma categoria antes de lançar transações.', 'erro');
        location.hash = '#categorias';
        return;
    }

    const editando = Boolean(t);
    const opcoes = estado.categorias.map(c =>
        `<option value="${c.id}" ${t && t.categoriaId === c.id ? 'selected' : ''}>${esc(c.nome)}</option>`
    ).join('');

    abrirModal(editando ? 'Editar transação' : 'Nova transação', `
        <div class="campo">
            <label>Tipo</label>
            <div class="alternar">
                <label><input type="radio" name="tipo" value="DESPESA" ${!t || t.tipo === 'DESPESA' ? 'checked' : ''}><span>Despesa</span></label>
                <label><input type="radio" name="tipo" value="RECEITA" ${t && t.tipo === 'RECEITA' ? 'checked' : ''}><span>Receita</span></label>
            </div>
        </div>
        <div class="campo">
            <label for="f-descricao">Descrição</label>
            <input id="f-descricao" name="descricao" required maxlength="120" placeholder="Ex: Mercado, Salário..." value="${esc(t?.descricao)}">
        </div>
        <div class="linha">
            <div class="campo">
                <label for="f-valor">Valor (R$)</label>
                <input id="f-valor" name="valor" type="number" step="0.01" min="0.01" required value="${t ? t.valor : ''}">
            </div>
            <div class="campo">
                <label for="f-data">Data</label>
                <input id="f-data" name="data" type="date" required value="${t ? t.data : hojeISO()}">
            </div>
        </div>
        <div class="campo">
            <label for="f-categoria">Categoria</label>
            <select id="f-categoria" name="categoriaId" required>${opcoes}</select>
        </div>
    `, async (dados) => {
        const corpo = {
            tipo: dados.tipo,
            descricao: dados.descricao,
            valor: parseFloat(dados.valor),
            data: dados.data,
            categoriaId: Number(dados.categoriaId)
        };

        if (editando) {
            await api(`/transacoes/${t.id}`, enviar('PUT', corpo));
            aviso('Transação atualizada.');
        } else {
            await api('/transacoes', enviar('POST', corpo));
            aviso('Transação cadastrada.');
        }
        navegar(false);
    });
}

// ---------- Categorias ----------
async function renderCategorias(valido) {
    await carregarCategorias();
    if (!valido()) return;

    const existentes = estado.categorias.map(c => c.nome.toLowerCase());
    const faltando = CATEGORIAS_PADRAO.filter(nome => !existentes.includes(nome.toLowerCase()));

    const botaoPadrao = faltando.length > 0
        ? `<button class="btn btn-neutro" id="btn-padrao">Adicionar categorias padrão</button>`
        : '';

    const itens = estado.categorias.map((c, i) => `<div class="item-categoria">
        <span class="ponto" style="background:${CORES[i % CORES.length]}"></span>
        <span class="nome">${esc(c.nome)}</span>
        <button class="btn-icone" data-editar="${c.id}" title="Renomear">${icone('editar')}</button>
        <button class="btn-icone perigo" data-excluir="${c.id}" title="Excluir">${icone('lixeira')}</button>
    </div>`).join('');

    pagina.innerHTML = `
        ${cabecalho('Categorias', 'Organize suas receitas e despesas',
            botaoPadrao + `<button class="btn btn-primario" id="btn-nova">${icone('mais')} Nova categoria</button>`)}
        ${estado.categorias.length === 0
            ? `<div class="painel">${vazio('Nenhuma categoria ainda. Clique em "Adicionar categorias padrão" para começar rápido.')}</div>`
            : `<div class="grade-categorias">${itens}</div>`}`;

    document.getElementById('btn-nova').addEventListener('click', () => abrirModalCategoria());

    if (faltando.length > 0) {
        document.getElementById('btn-padrao').addEventListener('click', async () => {
            try {
                for (const nome of faltando) {
                    await api('/categorias', enviar('POST', { nome }));
                }
                aviso('Categorias padrão adicionadas.');
                navegar(false);
            } catch (erro) {
                aviso(erro.message, 'erro');
            }
        });
    }

    pagina.querySelectorAll('[data-editar]').forEach(botao => {
        botao.addEventListener('click', () => {
            const c = estado.categorias.find(item => item.id === Number(botao.dataset.editar));
            abrirModalCategoria(c);
        });
    });

    pagina.querySelectorAll('[data-excluir]').forEach(botao => {
        botao.addEventListener('click', async () => {
            if (!confirm('Excluir esta categoria?')) return;
            try {
                await api(`/categorias/${botao.dataset.excluir}`, { method: 'DELETE' });
                aviso('Categoria excluída.');
                navegar(false);
            } catch (erro) {
                aviso(erro.message, 'erro');
            }
        });
    });
}

function abrirModalCategoria(c) {
    const editando = Boolean(c);

    abrirModal(editando ? 'Renomear categoria' : 'Nova categoria', `
        <div class="campo">
            <label for="f-nome">Nome</label>
            <input id="f-nome" name="nome" required maxlength="60" placeholder="Ex: Alimentação" value="${esc(c?.nome)}">
        </div>
    `, async (dados) => {
        if (editando) {
            await api(`/categorias/${c.id}`, enviar('PUT', { nome: dados.nome }));
            aviso('Categoria atualizada.');
        } else {
            await api('/categorias', enviar('POST', { nome: dados.nome }));
            aviso('Categoria criada.');
        }
        navegar(false);
    });
}

// ---------- Metas ----------
function textoPrazo(m) {
    if (!m.prazo) return 'Sem prazo definido';

    const [ano, mes, dia] = m.prazo.split('-').map(Number);
    const agora = new Date();
    const base = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const dias = Math.round((new Date(ano, mes - 1, dia) - base) / 86400000);

    if (m.concluida) return `Prazo: ${dataBR(m.prazo)}`;
    if (dias < 0) return `<span class="alerta">Prazo vencido em ${dataBR(m.prazo)}</span>`;
    if (dias === 0) return `<span class="alerta">Vence hoje!</span>`;

    // Quanto guardar por mês para chegar lá
    const mesesRestantes = Math.max(1, Math.ceil(dias / 30));
    const porMes = m.valorFaltante / mesesRestantes;
    return `Prazo: ${dataBR(m.prazo)} · faltam ${dias} dias<br>Guarde cerca de ${moeda(porMes)} por mês`;
}

async function renderMetas(valido) {
    const metas = await api('/metas');
    if (!valido()) return;

    const cartoes = metas.map(m => `<article class="meta ${m.concluida ? 'concluida' : ''}">
        <div class="meta-topo">
            <h3>${esc(m.nome)}</h3>
            ${m.concluida ? '<span class="selo">Concluída</span>' : ''}
        </div>
        <div class="meta-valores">
            <strong>${moeda(m.valorAtual)}</strong>
            <span>de ${moeda(m.valorAlvo)}</span>
        </div>
        <div class="barra"><div class="barra-preenchida" style="width:${Math.min(100, m.percentual)}%"></div></div>
        <div class="meta-info">
            <span>${porcentagem(m.percentual)}% concluído</span>
            <span>Faltam ${moeda(m.valorFaltante)}</span>
        </div>
        <div class="meta-prazo">${textoPrazo(m)}</div>
        <div class="meta-acoes">
            <button class="btn btn-primario btn-pequeno" data-depositar="${m.id}">Depositar</button>
            <button class="btn btn-neutro btn-pequeno" data-retirar="${m.id}" ${m.valorAtual <= 0 ? 'disabled' : ''}>Retirar</button>
            <span class="espaco"></span>
            <button class="btn-icone" data-editar="${m.id}" title="Editar">${icone('editar')}</button>
            <button class="btn-icone perigo" data-excluir="${m.id}" title="Excluir">${icone('lixeira')}</button>
        </div>
    </article>`).join('');

    pagina.innerHTML = `
        ${cabecalho('Metas', 'Acompanhe seus objetivos de economia',
            `<button class="btn btn-primario" id="btn-nova">${icone('mais')} Nova meta</button>`)}
        ${metas.length === 0
            ? `<div class="painel">${vazio('Você ainda não tem metas. Crie a primeira, por exemplo: "Viagem" ou "Reserva de emergência".')}</div>`
            : `<div class="grade-metas">${cartoes}</div>`}`;

    const achar = (id) => metas.find(m => m.id === Number(id));

    document.getElementById('btn-nova').addEventListener('click', () => abrirModalMeta());

    pagina.querySelectorAll('[data-depositar]').forEach(b =>
        b.addEventListener('click', () => abrirModalValor(achar(b.dataset.depositar), 'depositos')));
    pagina.querySelectorAll('[data-retirar]').forEach(b =>
        b.addEventListener('click', () => abrirModalValor(achar(b.dataset.retirar), 'retiradas')));
    pagina.querySelectorAll('[data-editar]').forEach(b =>
        b.addEventListener('click', () => abrirModalMeta(achar(b.dataset.editar))));

    pagina.querySelectorAll('[data-excluir]').forEach(botao => {
        botao.addEventListener('click', async () => {
            if (!confirm('Excluir esta meta?')) return;
            try {
                await api(`/metas/${botao.dataset.excluir}`, { method: 'DELETE' });
                aviso('Meta excluída.');
                navegar(false);
            } catch (erro) {
                aviso(erro.message, 'erro');
            }
        });
    });
}

function abrirModalMeta(m) {
    const editando = Boolean(m);

    abrirModal(editando ? 'Editar meta' : 'Nova meta', `
        <div class="campo">
            <label for="f-nome">Nome da meta</label>
            <input id="f-nome" name="nome" required maxlength="100" placeholder="Ex: Viagem, Reserva de emergência" value="${esc(m?.nome)}">
        </div>
        <div class="linha">
            <div class="campo">
                <label for="f-alvo">Valor alvo (R$)</label>
                <input id="f-alvo" name="valorAlvo" type="number" step="0.01" min="0.01" required value="${m ? m.valorAlvo : ''}">
            </div>
            <div class="campo">
                <label for="f-prazo">Prazo (opcional)</label>
                <input id="f-prazo" name="prazo" type="date" value="${m?.prazo ?? ''}">
            </div>
        </div>
    `, async (dados) => {
        const corpo = {
            nome: dados.nome,
            valorAlvo: parseFloat(dados.valorAlvo),
            prazo: dados.prazo || null
        };

        if (editando) {
            await api(`/metas/${m.id}`, enviar('PUT', corpo));
            aviso('Meta atualizada.');
        } else {
            await api('/metas', enviar('POST', corpo));
            aviso('Meta criada.');
        }
        navegar(false);
    });
}

// tipo = 'depositos' ou 'retiradas'
function abrirModalValor(m, tipo) {
    const deposito = tipo === 'depositos';

    abrirModal(`${deposito ? 'Depositar em' : 'Retirar de'} "${esc(m.nome)}"`, `
        <div class="campo">
            <label for="f-valor">Valor (R$)</label>
            <input id="f-valor" name="valor" type="number" step="0.01" min="0.01" required>
        </div>
    `, async (dados) => {
        await api(`/metas/${m.id}/${tipo}`, enviar('POST', { valor: parseFloat(dados.valor) }));
        aviso(deposito ? 'Depósito realizado.' : 'Retirada realizada.');
        navegar(false);
    }, deposito ? 'Depositar' : 'Retirar');
}

// ---------- Relatórios ----------
async function renderRelatorios(valido) {
    const [mensal, anual] = await Promise.all([
        api(`/relatorios/mensal?ano=${estado.ano}&mes=${estado.mes}`),
        api(`/relatorios/anual?ano=${estado.ano}`)
    ]);
    if (!valido()) return;

    const taxa = mensal.receitas > 0 ? (mensal.saldo / mensal.receitas) * 100 : 0;

    const totalReceitas = anual.reduce((s, d) => s + d.receitas, 0);
    const totalDespesas = anual.reduce((s, d) => s + d.despesas, 0);

    const linhasAno = anual.map(d => `<tr>
        <td>${MESES[d.mes - 1]}</td>
        <td class="direita positivo">${moeda(d.receitas)}</td>
        <td class="direita negativo">${moeda(d.despesas)}</td>
        <td class="direita ${d.saldo >= 0 ? 'positivo' : 'negativo'}">${moeda(d.saldo)}</td>
    </tr>`).join('');

    pagina.innerHTML = `
        ${cabecalho('Relatórios', 'Análise detalhada do mês e do ano', seletorMes())}

        <section class="cartoes">
            ${cartao('Receitas', moeda(mensal.receitas), 'subindo', 'verde')}
            ${cartao('Despesas', moeda(mensal.despesas), 'descendo', 'vermelho')}
            ${cartao('Saldo do mês', moeda(mensal.saldo), 'carteira', mensal.saldo >= 0 ? 'verde' : 'vermelho')}
            ${cartao('Economia do mês', porcentagem(taxa) + '%', 'porcentagem', 'azul')}
        </section>

        <section class="grade-2">
            <div class="painel">
                <h3>Despesas por categoria em ${MESES[estado.mes - 1]}</h3>
                ${htmlDespesasPorCategoria(mensal.despesasPorCategoria)}
            </div>
            <div class="painel">
                <h3>Evolução em ${estado.ano}</h3>
                ${htmlGraficoAnual(anual)}
            </div>
        </section>

        <div class="painel">
            <h3>Resumo de ${estado.ano}</h3>
            <div class="tabela-wrap"><table>
                <thead><tr><th>Mês</th><th class="direita">Receitas</th><th class="direita">Despesas</th><th class="direita">Saldo</th></tr></thead>
                <tbody>${linhasAno}</tbody>
                <tfoot><tr>
                    <td>Total</td>
                    <td class="direita positivo">${moeda(totalReceitas)}</td>
                    <td class="direita negativo">${moeda(totalDespesas)}</td>
                    <td class="direita ${totalReceitas - totalDespesas >= 0 ? 'positivo' : 'negativo'}">${moeda(totalReceitas - totalDespesas)}</td>
                </tr></tfoot>
            </table></div>
        </div>

        <div class="painel">
            <h3>Exportar extrato (CSV)</h3>
            <div class="filtros">
                <div class="campo">
                    <label for="csv-inicio">De</label>
                    <input type="date" id="csv-inicio" value="${inicioDoMes(estado.ano, estado.mes)}">
                </div>
                <div class="campo">
                    <label for="csv-fim">Até</label>
                    <input type="date" id="csv-fim" value="${fimDoMes(estado.ano, estado.mes)}">
                </div>
                <button class="btn btn-neutro" id="btn-csv">${icone('baixar')} Baixar extrato</button>
            </div>
        </div>`;

    ligarSeletorMes();

    document.getElementById('btn-csv').addEventListener('click', () => {
        const inicio = document.getElementById('csv-inicio').value;
        const fim = document.getElementById('csv-fim').value;
        if (!inicio || !fim) {
            aviso('Escolha as duas datas.', 'erro');
            return;
        }
        window.location.href = `${API}/relatorios/extrato.csv?inicio=${inicio}&fim=${fim}`;
    });
}

// ===================== Navegação =====================

const paginas = {
    dashboard: renderDashboard,
    transacoes: renderTransacoes,
    categorias: renderCategorias,
    metas: renderMetas,
    relatorios: renderRelatorios
};

let versaoDaPagina = 0;

// Desenha a página que está no endereço (#dashboard, #metas, ...)
// mostrarCarregando = false evita piscar a tela quando só atualizamos os dados
async function navegar(mostrarCarregando = true) {
    const nome = (location.hash || '#dashboard').slice(1);
    const render = paginas[nome] || renderDashboard;
    const nomeAtivo = paginas[nome] ? nome : 'dashboard';

    document.querySelectorAll('.sidebar nav a').forEach(link => {
        link.classList.toggle('ativo', link.dataset.pagina === nomeAtivo);
    });

    // Se o usuário trocar de página rápido, ignoramos a resposta antiga
    const minhaVersao = ++versaoDaPagina;
    const valido = () => minhaVersao === versaoDaPagina;

    if (mostrarCarregando) {
        pagina.innerHTML = '<div class="carregando">Carregando...</div>';
    }

    try {
        await render(valido);
    } catch (erro) {
        if (!valido()) return;
        pagina.innerHTML = `<div class="erro-pagina">
            <h3>Não foi possível carregar os dados</h3>
            <p>${esc(erro.message)}</p>
            <p>Confira se a aplicação e o banco PostgreSQL estão rodando.</p>
            <button class="btn btn-primario" id="btn-tentar">Tentar de novo</button>
        </div>`;
        document.getElementById('btn-tentar').addEventListener('click', () => navegar(true));
    }
}

function iniciar() {
    document.querySelectorAll('[data-icone]').forEach(el => {
        el.innerHTML = icone(el.dataset.icone);
    });

    // Clicar fora da janela fecha ela
    const modal = document.getElementById('modal');
    modal.addEventListener('click', evento => {
        if (evento.target === modal) modal.close();
    });

    window.addEventListener('hashchange', () => navegar(true));
    navegar(true);
}

iniciar();
