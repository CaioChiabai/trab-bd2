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
    await api('/api/clientes', {
      method: 'POST',
      body: {
        nome: form.get('nome'),
        endereco: form.get('endereco'),
        telefone: form.get('telefone'),
        email: form.get('email'),
        tipo
      }
    });
    event.currentTarget.reset();
    await refreshData();
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
    await refreshData();
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
          logradouro: form.get('logradouro'),
          numero: form.get('numero'),
          bairro: form.get('bairro'),
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
    await refreshData();
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
    await refreshData();
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
  document.getElementById('clientesCount').textContent = state.clientes.length;
  const list = document.getElementById('clientesList');
  list.innerHTML = '';
  state.clientes.forEach((cliente) => {
    list.appendChild(renderItem({
      title: cliente.nome,
      lines: [
        `${cliente.tipo.join(', ')} | ${cliente.email} | ${cliente.telefone}`,
        cliente.endereco,
        `Interesses: ${cliente.interesses?.length || 0}`
      ],
      onDelete: () => remove(endpoints.clientes, cliente._id)
    }));
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
  document.getElementById('imoveisCount').textContent = state.imoveis.length;
  const list = document.getElementById('imoveisList');
  list.innerHTML = '';
  state.imoveis.forEach((imovel) => {
    const vendedor = state.clientes.find((cliente) => cliente._id === imovel.dono_id);
    list.appendChild(renderItem({
      title: `${imovel.tipo} - ${money(imovel.preco)}`,
      lines: [
        `${imovel.endereco.logradouro}, ${imovel.endereco.numero}, ${imovel.endereco.bairro}, ${imovel.endereco.cidade}/${imovel.endereco.uf}`,
        `Vendedor: ${vendedor?.nome || imovel.dono_id}`,
        `Ocupado: ${imovel.ocupado ? 'sim' : 'nao'}`
      ],
      onDelete: () => remove(endpoints.imoveis, imovel._id)
    }));
  });
}

async function loadVisitas() {
  state.visitas = await api(endpoints.visitas);
  document.getElementById('visitasCount').textContent = state.visitas.length;
  const list = document.getElementById('visitasList');
  list.innerHTML = '';
  state.visitas.forEach((visita) => {
    const cliente = state.clientes.find((item) => item._id === visita.cliente_id);
    const imovel = state.imoveis.find((item) => item._id === visita.imovel_id);
    list.appendChild(renderItem({
      title: `${cliente?.nome || visita.cliente_id} visitou ${imovel?.tipo || visita.imovel_id}`,
      lines: [
        new Date(visita.data_hora).toLocaleString('pt-BR'),
        visita.observacao || 'Sem observacao'
      ],
      onDelete: () => remove(endpoints.visitas, visita._id)
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
    ['find: imoveis disponiveis', '/api/consultas/find/imoveis-disponiveis'],
    ['find: compradores com interesses', '/api/consultas/find/compradores-com-interesses'],
    ['aggregate: imoveis por tipo', '/api/consultas/aggregate/imoveis-por-tipo'],
    ['aggregate: preco medio por localidade', '/api/consultas/aggregate/preco-medio-localidade'],
    ['aggregate: imoveis com vendedor', '/api/consultas/aggregate/imoveis-com-vendedor'],
    ['aggregate: visitas com cliente e imovel', '/api/consultas/aggregate/visitas-com-cliente-imovel'],
    ['funcoes agregadas: menor e maior preco', '/api/consultas/aggregate/preco-min-max'],
    ['funcoes agregadas: visitas por imovel', '/api/consultas/aggregate/visitas-por-imovel'],
    ['funcoes agregadas: imoveis por vendedor', '/api/consultas/aggregate/imoveis-por-vendedor']
  ];

  const output = document.getElementById('queriesOutput');
  output.innerHTML = '';
  for (const [title, url] of queries) {
    const data = await api(url);
    const block = document.createElement('section');
    block.className = 'query-block';
    block.innerHTML = `<h3>${title}</h3><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
    output.appendChild(block);
  }
}

function renderItem({ title, lines, onDelete }) {
  const template = document.getElementById('itemTemplate').content.cloneNode(true);
  template.querySelector('.item-body').innerHTML = `<h3>${escapeHtml(title)}</h3>${lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('')}`;
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'danger';
  removeButton.textContent = 'Excluir';
  removeButton.addEventListener('click', onDelete);
  template.querySelector('.item-actions').appendChild(removeButton);
  return template;
}

async function remove(endpoint, id) {
  await api(`${endpoint}/${id}`, { method: 'DELETE' });
  await refreshData();
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

handleAction(refreshData);
