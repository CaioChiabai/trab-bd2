import {
  TIPOS_LOGRADOURO,
  UFS,
  TIPOS_IMOVEL
} from './constants.js';

const editingState = {
  clienteId: null,
  imovelId: null,
  visitaId:null,
  interesseClienteId: null,
  interesseIndex: null
};

function preencherSelect(select, options, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;

  options.forEach(optionValue => {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue;
    select.appendChild(option);
  });
}

function carregarOpcoesFixas() {
  
  preencherSelect(
  document.querySelector('#imovelForm select[name="tipo"]'),
  TIPOS_IMOVEL,
  'Tipo do imóvel'
);

  // CLIENTES
  preencherSelect(
    document.querySelector('#clienteForm select[name="tipo_logradouro"]'),
    TIPOS_LOGRADOURO,
    'Tipo logradouro'
  );

  preencherSelect(
    document.querySelector('#clienteForm select[name="uf"]'),
    UFS,
    'UF'
  );

  // IMÓVEIS
  preencherSelect(
    document.querySelector('#imovelForm select[name="tipo_logradouro"]'),
    TIPOS_LOGRADOURO,
    'Tipo logradouro'
  );

  preencherSelect(
    document.querySelector('#imovelForm select[name="uf"]'),
    UFS,
    'UF'
  );
}

const state = {
  clientes: [],
  imoveis: [],
  visitas: []
};

const endpoints = {
  clientes: '/api/clientes',
  imoveis: '/api/imoveis',
  visitas: '/api/visitas'
};

document.querySelectorAll('.tab').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((panel) => panel.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(button.dataset.tab).classList.add('active');
  });
});

const refreshButton = document.getElementById('refreshAll');
let currentRefresh = Promise.resolve();

refreshButton.addEventListener('click', () => {
  currentRefresh = handleAction(refreshData);
});
document.getElementById('applyFilters').addEventListener('click', () => handleAction(loadImoveis));
document.getElementById('runQueries').addEventListener('click', () => handleAction(runQueries));

document.getElementById('clienteForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  await handleAction(async () => {
    const form = new FormData(event.currentTarget);
    const tipo = form.getAll('tipo');
    if (tipo.length === 0) {
      alert('Selecione pelo menos um tipo de cliente.');
      return;
    };
    const novoCliente = await api('/api/clientes', {
      method: 'POST',
      body: {
        nome: form.get('nome'),
        endereco: {
        tipo_logradouro: form.get('tipo_logradouro'),
        logradouro: form.get('logradouro'),
        numero: form.get('numero'),
        complemento: form.get('complemento'),
        bairro: form.get('bairro'),
        cep: form.get('cep'),
        cidade: form.get('cidade'),
        uf: form.get('uf')
        },
        telefone: form.get('telefone'),
        email: form.get('email'),
        tipo
      }
    });
    upsertCliente(novoCliente);
    populateClienteSelects();
    event.currentTarget.reset();
    await clickRefreshButton();
  });
});

document.getElementById('interesseForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  await handleAction(async () => {
    const form = new FormData(event.currentTarget);
    await api(`/api/clientes/${form.get('cliente_id')}/interesses`, {
      method: 'POST',
      body: {
        quartos: Number(form.get('quartos')),
        tamanho_min_m2: Number(form.get('tamanho_min_m2')),
        area_lazer: form.get('area_lazer') === 'on',
        bairro: form.get('bairro'),
        cidade: form.get('cidade'),
        uf: form.get('uf'),
        valor_maximo: Number(form.get('valor_maximo'))
      }
    });
    event.currentTarget.reset();
    await clickRefreshButton();
  });
});

document.getElementById('imovelForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  await handleAction(async () => {
    const form = new FormData(event.currentTarget);
    await api('/api/imoveis', {
      method: 'POST',
      body: {
        tipo: form.get('tipo'),
        endereco: {
        tipo_logradouro: form.get('tipo_logradouro'),
        logradouro: form.get('logradouro'),
        numero: form.get('numero'),
        complemento: form.get('complemento'),
        bairro: form.get('bairro'),
        cep: form.get('cep'),
        cidade: form.get('cidade'),
        uf: form.get('uf')
      },
        preco: Number(form.get('preco')),
        data_construcao: form.get('data_construcao'),
        ocupado: form.get('ocupado') === 'on',
        dono_id: form.get('dono_id')
      }
    });
    event.currentTarget.reset();
    await clickRefreshButton();
  });
});

document.getElementById('visitaForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  await handleAction(async () => {
    const form = new FormData(event.currentTarget);
    await api('/api/visitas', {
      method: 'POST',
      body: {
        cliente_id: form.get('cliente_id'),
        imovel_id: form.get('imovel_id'),
        data_hora: form.get('data_hora'),
        observacao: form.get('observacao')
      }
    });
    event.currentTarget.reset();
    await clickRefreshButton();
  });
});

async function clickRefreshButton() {
  refreshButton.click();
  await currentRefresh;
}

async function refreshData() {
  refreshButton.disabled = true;
  refreshButton.textContent = 'Atualizando...';
  try {
    await loadAll();
  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = 'Atualizar dados';
  }
}

async function loadAll() {
  await loadClientes();
  populateClienteSelects();
  await loadImoveis();
  await loadVisitas();
  populateSelects();
}

async function loadClientes() {
  state.clientes = await api(endpoints.clientes);

  document.getElementById('clientesCount').textContent =
    state.clientes.length;

  const list = document.getElementById('clientesList');
  list.innerHTML = '';

  state.clientes.forEach((cliente) => {

    // CLIENTE EM MODO EDIÇÃO
    if (editingState.clienteId === cliente._id) {
      list.appendChild(renderClienteEditor(cliente));
      return;
    }

    const card = renderItem({
      title: cliente.nome,
      lines: [
        `${cliente.tipo.join(', ')} | ${cliente.email} | ${cliente.telefone}`,
        `${cliente.endereco.tipo_logradouro} ${cliente.endereco.logradouro}, ${cliente.endereco.numero} - ${cliente.endereco.bairro}, ${cliente.endereco.cidade}/${cliente.endereco.uf}`,
        `Interesses: ${cliente.interesses?.length || 0}`
      ],

      onEdit: () => {
        editingState.clienteId = cliente._id;
        loadClientes();
      },

      onDelete: () => remove(endpoints.clientes, cliente._id)
    });

    const actions = card.querySelector('.item-actions');

    // BOTÕES DE EDIÇÃO DOS INTERESSES
    (cliente.interesses || []).forEach((interesse, index) => {

      const btn = document.createElement('button');

      btn.type = 'button';
      btn.className = 'secondary';
      btn.textContent = `Editar Interesse ${index + 1}`;

      btn.onclick = () => {
        editingState.interesseClienteId = cliente._id;
        editingState.interesseIndex = index;
        loadClientes();
      };

      actions.appendChild(btn);
    });

    list.appendChild(card);

    // RENDERIZA O FORMULÁRIO DE EDIÇÃO DO INTERESSE
    (cliente.interesses || []).forEach((interesse, index) => {

      if (
        editingState.interesseClienteId === cliente._id &&
        editingState.interesseIndex === index
      ) {

        list.appendChild(
          renderInteresseEditor(
            cliente,
            interesse,
            index
          )
        );
      }
    });

  });
}

async function loadImoveis() {
  const params = new URLSearchParams();

  const tipo = document.getElementById('filterTipo').value;
  const cidade = document.getElementById('filterCidade').value;
  const bairro = document.getElementById('filterBairro').value;
  const precoMax = document.getElementById('filterPrecoMax').value;
  const disponiveis = document.getElementById('filterDisponiveis').checked;

  if (tipo) params.set('tipo', tipo);
  if (cidade) params.set('cidade', cidade);
  if (bairro) params.set('bairro', bairro);
  if (precoMax) params.set('preco_max', precoMax);
  if (disponiveis) params.set('disponiveis', 'true');

  state.imoveis = await api(`${endpoints.imoveis}?${params.toString()}`);

  document.getElementById('imoveisCount').textContent =
    state.imoveis.length;

  const list = document.getElementById('imoveisList');
  list.innerHTML = '';

  state.imoveis.forEach((imovel) => {

    // MODO EDIÇÃO
    if (editingState.imovelId === imovel._id) {
      list.appendChild(renderImovelEditor(imovel));
      return;
    }

    // MODO VISUALIZAÇÃO NORMAL
    const vendedor = state.clientes.find(
      (cliente) => cliente._id === imovel.dono_id
    );

    list.appendChild(
      renderItem({
        title: `${imovel.tipo} - ${money(imovel.preco)}`,
        lines: [
          `${imovel.endereco.tipo_logradouro} ${imovel.endereco.logradouro}, ${imovel.endereco.numero} - ${imovel.endereco.bairro}, ${imovel.endereco.cidade}/${imovel.endereco.uf}`,
          `Vendedor: ${vendedor?.nome || imovel.dono_id}`,
          `Ocupado: ${imovel.ocupado ? 'sim' : 'nao'}`
        ],
        onEdit: () => editarImovel(imovel),
        onDelete: () => remove(endpoints.imoveis, imovel._id)
      })
    );
  });
}

async function loadVisitas() {

  state.visitas = await api(endpoints.visitas);

  document.getElementById('visitasCount').textContent =
    state.visitas.length;

  const list = document.getElementById('visitasList');

  list.innerHTML = '';

  state.visitas.forEach((visita) => {

    const cliente =
      state.clientes.find(
        item => item._id === visita.cliente_id
      );

    const imovel =
      state.imoveis.find(
        item => item._id === visita.imovel_id
      );

    // VISITA EM MODO EDIÇÃO
    if (editingState.visitaId === visita._id) {

      list.appendChild(
        renderVisitaEditor(
          visita,
          cliente,
          imovel
        )
      );

      return;
    }

    list.appendChild(renderItem({

      title:
        `${cliente?.nome || visita.cliente_id} visitou ${imovel?.tipo || visita.imovel_id}`,

      lines: [
        new Date(visita.data_hora)
          .toLocaleString('pt-BR'),

        visita.observacao ||
        'Sem observacao'
      ],

      onEdit: () => {

        editingState.visitaId =
          visita._id;

        loadVisitas();
      },

      onDelete: () =>
        remove(
          endpoints.visitas,
          visita._id
        )

    }));

  });

}

function populateSelects() {
  populateClienteSelects();
  fillSelect(
    document.querySelector('#visitaForm select[name="imovel_id"]'),
    state.imoveis,
    'Selecione imovel',
    (imovel) => `${imovel.tipo} - ${imovel.endereco.bairro} - ${money(imovel.preco)}`
  );
}

function populateClienteSelects() {
  const vendedores = state.clientes.filter((cliente) => hasTipo(cliente, 'vendedor'));
  const compradores = state.clientes.filter((cliente) => hasTipo(cliente, 'comprador'));

  fillSelect(document.querySelector('#imovelForm select[name="dono_id"]'), vendedores, 'Selecione vendedor');
  fillSelect(document.querySelector('#interesseForm select[name="cliente_id"]'), compradores, 'Selecione comprador');
  fillSelect(document.querySelector('#visitaForm select[name="cliente_id"]'), compradores, 'Selecione comprador');
}

function upsertCliente(cliente) {
  const index = state.clientes.findIndex((item) => item._id === cliente._id);
  if (index >= 0) {
    state.clientes[index] = cliente;
  } else {
    state.clientes.push(cliente);
    state.clientes.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }
}

function hasTipo(cliente, tipo) {
  const tipos = Array.isArray(cliente.tipo) ? cliente.tipo : [cliente.tipo];
  return tipos.includes(tipo);
}

async function handleAction(action) {
  try {
    await action();
  } catch (error) {
    console.error(error);
  }
}

function fillSelect(select, items, placeholder, label = (item) => item.nome) {
  const current = select.value;
  select.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item._id;
    option.textContent = label(item);
    select.appendChild(option);
  });
  select.value = current;
}

async function runQueries() {
  const queries = [
    ['Aggregate: Preço Médio por Localidade', '/api/consultas/aggregate/preco-medio-localidade'],
    ['Aggregate: Imóveis por Tipo', '/api/consultas/aggregate/imoveis-por-tipo'],
    ['Aggregate: Visitas por Imóvel', '/api/consultas/aggregate/visitas-por-imovel']
    // ... adicione as outras consultas aqui
  ];

  const output = document.getElementById('queriesOutput');
  output.innerHTML = ''; // Limpa a tela de consultas anteriores

  for (const [title, url] of queries) {
    const block = document.createElement('section');
    block.className = 'query-block';
    // Estado de Loading (UX)
    block.innerHTML = `<h3>${escapeHtml(title)}</h3><p class="text-muted">Carregando dados...</p>`;
    output.appendChild(block);

    try {
      const data = await api(url);
      
      // Estado Vazio (Error Handling visual)
      if (!data || data.length === 0) {
        block.innerHTML = `<h3>${escapeHtml(title)}</h3>
          <div class="empty-state">
            <p>Nenhum resultado encontrado para esta consulta.</p>
          </div>`;
        continue;
      }

      // Renderiza uma tabela dinâmica
      block.innerHTML = `<h3>${escapeHtml(title)}</h3>`;
      block.appendChild(renderGenericTable(data));

    } catch (error) {
      // Estado de Erro / Falha de Conexão
      block.innerHTML = `<h3>${escapeHtml(title)}</h3>
        <div class="error-state" style="color: var(--danger-color); border: 1px solid var(--danger-color); padding: 1rem; border-radius: 4px;">
          <p>⚠️ Falha ao carregar: ${escapeHtml(error.message)}</p>
        </div>`;
    }
  }
}

function renderImovelEditor(imovel) {

  const div = document.createElement('div');

  div.className = 'item editing-card';

  div.innerHTML = `
    <div class="item-body">

      <h3>Editando Imóvel</h3>

      <input
        id="edit-imovel-tipo"
        value="${imovel.tipo || ''}"
        placeholder="Tipo"
      >

      <input
        id="edit-imovel-logradouro"
        value="${imovel.endereco?.logradouro || ''}"
        placeholder="Logradouro"
      >

      <input
        id="edit-imovel-numero"
        value="${imovel.endereco?.numero || ''}"
        placeholder="Número"
      >

      <input
        id="edit-imovel-bairro"
        value="${imovel.endereco?.bairro || ''}"
        placeholder="Bairro"
      >

      <input
        id="edit-imovel-cidade"
        value="${imovel.endereco?.cidade || ''}"
        placeholder="Cidade"
      >

      <input
        id="edit-imovel-uf"
        value="${imovel.endereco?.uf || ''}"
        placeholder="UF"
      >

      <input
        id="edit-imovel-cep"
        value="${imovel.endereco?.cep || ''}"
        placeholder="CEP"
      >

      <input
        id="edit-imovel-preco"
        type="number"
        value="${imovel.preco || 0}"
        placeholder="Preço"
      >

      <input
        id="edit-imovel-data"
        type="date"
        value="${new Date(imovel.data_construcao)
          .toISOString()
          .split('T')[0]}"
      >

      <label>
        <input
          type="checkbox"
          id="edit-imovel-ocupado"
          ${imovel.ocupado ? 'checked' : ''}
        >
        Ocupado
      </label>

    </div>

    <div class="item-actions">

      <button
        type="button"
        class="primary"
      >
        Salvar
      </button>

      <button
        type="button"
        class="secondary"
      >
        Cancelar
      </button>

    </div>
  `;

  const buttons =
    div.querySelectorAll('button');

  buttons[0].onclick =
    () => salvarImovel(imovel);

  buttons[1].onclick =
    () => {

      editingState.imovelId = null;

      loadImoveis();
    };

  return div;
}

/**
 * Função Factory para renderizar tabelas HTML a partir de qualquer Array de Objetos JSON.
 * Mantém o padrão de UI e simplifica a manutenção.
 */
function renderGenericTable(data) {
  const table = document.createElement('table');
  table.className = 'data-table'; // Sugiro adicionar estilos de border-collapse e padding no CSS
  table.style.width = '100%';
  
  // Extrai cabeçalhos da primeira linha (achatando objetos aninhados se houver)
  const headers = Object.keys(data[0]);
  
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr>${headers.map(h => `<th>${escapeHtml(h.toUpperCase())}</th>`).join('')}</tr>`;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = headers.map(key => {
      let val = row[key];
      
      // Interface de Dados: Badges e Formatação
      if (typeof val === 'boolean') {
        return `<td><span class="badge ${val ? 'bg-success' : 'bg-danger'}">${val ? 'Sim' : 'Não'}</span></td>`;
      }
      
      if (typeof val === 'object' && val !== null) {
        // Para objetos agregados como _id: { cidade, bairro }
        val = Object.values(val).join(' - '); 
      }

      // Se for uma chave de preço, formata automaticamente
      if (key.includes('preco') || key.includes('valor')) {
        val = money(val);
      }
      
      return `<td>${escapeHtml(val)}</td>`;
    }).join('');
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  return table;
}

function renderItem({ title, lines, onDelete, onEdit }) {
  const template = document.getElementById('itemTemplate').content.cloneNode(true);

  template.querySelector('.item-body').innerHTML =
    `<h3>${escapeHtml(title)}</h3>` +
    lines.map(line => `<p>${escapeHtml(line)}</p>`).join('');

  const actions = template.querySelector('.item-actions');

  if (onEdit) {
    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'secondary';
    editButton.textContent = 'Editar';
    editButton.addEventListener('click', onEdit);
    actions.appendChild(editButton);
  }

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'danger';
  removeButton.textContent = 'Excluir';
  removeButton.addEventListener('click', onDelete);

  actions.appendChild(removeButton);

  const editButton =
  document.createElement('button');

  editButton.type = 'button';
  editButton.className = 'secondary';
  editButton.textContent = 'Editar';

  editButton.addEventListener(
    'click',
    onEdit
  );

  actions.appendChild(editButton);

  return template;
}

function renderClienteEditor(cliente) {

  const wrapper = document.createElement('div');
  wrapper.className = 'item editing';

  wrapper.innerHTML = `
    <input id="edit-nome-${cliente._id}" value="${cliente.nome}">
    <input id="edit-telefone-${cliente._id}" value="${cliente.telefone}">
    <input id="edit-email-${cliente._id}" value="${cliente.email}">

    <input id="edit-logradouro-${cliente._id}"
      value="${cliente.endereco.logradouro}">

    <input id="edit-numero-${cliente._id}"
      value="${cliente.endereco.numero}">

    <input id="edit-bairro-${cliente._id}"
      value="${cliente.endereco.bairro}">

    <input id="edit-cidade-${cliente._id}"
      value="${cliente.endereco.cidade}">

    <input id="edit-uf-${cliente._id}"
      value="${cliente.endereco.uf}">
  `;

  const salvar = document.createElement('button');
  salvar.textContent = 'Salvar';

  salvar.onclick = async () => {

    await api(`/api/clientes/${cliente._id}`, {
      method: 'PUT',
      body: {
        nome: document.getElementById(`edit-nome-${cliente._id}`).value,
        telefone: document.getElementById(`edit-telefone-${cliente._id}`).value,
        email: document.getElementById(`edit-email-${cliente._id}`).value,

        endereco: {
          ...cliente.endereco,
          logradouro: document.getElementById(`edit-logradouro-${cliente._id}`).value,
          numero: document.getElementById(`edit-numero-${cliente._id}`).value,
          bairro: document.getElementById(`edit-bairro-${cliente._id}`).value,
          cidade: document.getElementById(`edit-cidade-${cliente._id}`).value,
          uf: document.getElementById(`edit-uf-${cliente._id}`).value
        },

        tipo: cliente.tipo
      }
    });

    editingState.clienteId = null;
    await clickRefreshButton();
  };

  const cancelar = document.createElement('button');
  cancelar.textContent = 'Cancelar';

  cancelar.onclick = async () => {
    editingState.clienteId = null;
    await loadClientes();
  };

  wrapper.appendChild(salvar);
  wrapper.appendChild(cancelar);

  return wrapper;
}

function renderInteresseEditor(cliente, interesse, index) {
  const div = document.createElement('div');

  div.innerHTML = `
    <div class="form-grid">

      <input class="edit-quartos"
             type="number"
             value="${interesse.quartos}">

      <input class="edit-tamanho"
             type="number"
             value="${interesse.tamanho_min_m2}">

      <input class="edit-bairro"
             value="${interesse.bairro}">

      <input class="edit-cidade"
             value="${interesse.cidade}">

      <input class="edit-uf"
             value="${interesse.uf}">

      <input class="edit-valor"
             type="number"
             value="${interesse.valor_maximo}">

      <label>
        <input
          class="edit-area"
          type="checkbox"
          ${interesse.area_lazer ? 'checked' : ''}
        >
        Área de lazer
      </label>

      <button class="primary save-btn">
        Salvar
      </button>

      <button class="secondary cancel-btn">
        Cancelar
      </button>

    </div>
  `;

  div.querySelector('.save-btn')
    .addEventListener('click', async () => {

      await api(
        `/api/clientes/${cliente._id}/interesses/${index}`,
        {
          method: 'PUT',
          body: {
            quartos:
              Number(div.querySelector('.edit-quartos').value),

            tamanho_min_m2:
              Number(div.querySelector('.edit-tamanho').value),

            bairro:
              div.querySelector('.edit-bairro').value,

            cidade:
              div.querySelector('.edit-cidade').value,

            uf:
              div.querySelector('.edit-uf').value,

            valor_maximo:
              Number(div.querySelector('.edit-valor').value),

            area_lazer:
              div.querySelector('.edit-area').checked
          }
        }
      );

      editingState.interesseClienteId = null;
      editingState.interesseIndex = null;

      await clickRefreshButton();
    });

  div.querySelector('.cancel-btn')
    .addEventListener('click', () => {
      editingState.interesseClienteId = null;
      editingState.interesseIndex = null;
      loadClientes();
    });

  return div;
}

function renderVisitaEditor(
  visita,
  cliente,
  imovel
) {

  const div = document.createElement('div');

  div.className = 'item editing-card';

  const dataHora =
    new Date(visita.data_hora)
      .toISOString()
      .slice(0, 16);

  div.innerHTML = `
    <div class="item-body">

      <h3>Editando Visita</h3>

      <p>
        Cliente:
        ${cliente?.nome || ''}
      </p>

      <p>
        Imóvel:
        ${imovel?.tipo || ''}
      </p>

      <input
        type="datetime-local"
        id="edit-visita-data"
        value="${dataHora}"
      >

      <textarea
        id="edit-visita-observacao"
        rows="4"
      >${visita.observacao || ''}</textarea>

    </div>

    <div class="item-actions">

      <button
        class="primary"
        type="button"
      >
        Salvar
      </button>

      <button
        class="secondary"
        type="button"
      >
        Cancelar
      </button>

    </div>
  `;

  const botoes =
    div.querySelectorAll('button');

  botoes[0].onclick =
    () => salvarVisita(visita);

  botoes[1].onclick =
    () => {

      editingState.visitaId =
        null;

      loadVisitas();
    };

  return div;
}

async function remove(endpoint, id) {
  await api(`${endpoint}/${id}`, { method: 'DELETE' });
  await clickRefreshButton();
}

async function salvarVisita(visita) {

  const data_hora =
    document.getElementById(
      'edit-visita-data'
    ).value;

  const observacao =
    document.getElementById(
      'edit-visita-observacao'
    ).value;

  await api(

    `/api/visitas/${visita._id}`,

    {
      method: 'PUT',

      body: {
        cliente_id:
          visita.cliente_id,

        imovel_id:
          visita.imovel_id,

        data_hora,

        observacao
      }
    }

  );

  editingState.visitaId =
    null;

  await loadVisitas();
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    method: options.method || 'GET',
    cache: 'no-store',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    alert(error.error || 'Erro na requisicao');
    throw new Error(error.error || response.statusText);
  }

  if (response.status === 204) return null;
  return response.json();
}

function money(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}

function editarCliente(cliente) {
  editingState.clienteId = cliente._id;
  loadClientes();
}

function editarImovel(imovel) {
  editingState.imovelId = imovel._id;
  loadImoveis();
}

carregarOpcoesFixas();
handleAction(refreshData);
