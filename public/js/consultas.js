import { api } from './api.js';
import { renderGenericTable } from './components.js';
import { escapeHtml } from './utils.js';

export async function runQueries() {
  const queries = [
    ['Aggregate: Preço Médio por Localidade', '/api/consultas/aggregate/preco-medio-localidade'],
    ['Aggregate: Imóveis por Tipo', '/api/consultas/aggregate/imoveis-por-tipo'],
    ['Aggregate: Visitas por Imóvel', '/api/consultas/aggregate/visitas-por-imovel'],
    ['Aggregate: Imóveis com Vendedor', '/api/consultas/aggregate/imoveis-com-vendedor'],
    ['Aggregate: Preço Mínimo e Máximo', '/api/consultas/aggregate/preco-min-max'],
    ['Aggregate: Visitas com Cliente e Imóvel', '/api/consultas/aggregate/visitas-com-cliente-imovel'],
    ['Aggregate: Imóveis por Vendedor', '/api/consultas/aggregate/imoveis-por-vendedor'],
    ['Find: Compradores com Interesses', '/api/consultas/find/compradores-com-interesses'],
    ['Find: Imóveis (Paginação e Filtros via Query string)', '/api/consultas/find/imoveis?page=1&limit=5']
  ];

  const output = document.getElementById('queriesOutput');
  output.innerHTML = '';

  for (const [title, url] of queries) {
    const block = document.createElement('section');
    block.className = 'query-block';
    block.innerHTML = `<h3>${escapeHtml(title)}</h3><p style="color: var(--color-text-muted);">Carregando dados...</p>`;
    output.appendChild(block);

    try {
      const data = await api(url);
      const payload = data && data.data && data.meta ? data.data : data;

      if (!payload || payload.length === 0) {
        block.innerHTML = `<h3>${escapeHtml(title)}</h3>
          <div class="empty-state">
            <p style="color: var(--color-text-muted);">Nenhum resultado encontrado para esta consulta.</p>
          </div>`;
        continue;
      }

      block.innerHTML = `<h3>${escapeHtml(title)}</h3>`;
      block.appendChild(renderGenericTable(payload));

    } catch (error) {
      block.innerHTML = `<h3>${escapeHtml(title)}</h3>
        <div class="error-state" style="color: var(--color-danger); padding: 1rem; border: 1px solid var(--color-danger); border-radius: var(--radius-md);">
          <p>⚠️ Falha ao carregar: ${escapeHtml(error.message)}</p>
        </div>`;
    }
  }
}
