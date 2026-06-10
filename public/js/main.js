import { api } from './api.js';
import { handleAction, preencherSelect } from './utils.js';
import { TIPOS_LOGRADOURO, UFS, TIPOS_IMOVEL } from '/constants.js';

import { loadClientes, populateClienteSelects } from './clientes.js';
import { loadImoveis, populateImovelSelects } from './imoveis.js';
import { loadVisitas } from './visitas.js';
import { runQueries } from './consultas.js';

function carregarOpcoesFixas() {
  preencherSelect(document.querySelector('#imovelForm select[name="tipo"]'), TIPOS_IMOVEL, 'Tipo do imóvel');
  preencherSelect(document.querySelector('#clienteForm select[name="tipo_logradouro"]'), TIPOS_LOGRADOURO, 'Tipo logradouro');
  preencherSelect(document.querySelector('#clienteForm select[name="uf"]'), UFS, 'UF');
  preencherSelect(document.querySelector('#imovelForm select[name="tipo_logradouro"]'), TIPOS_LOGRADOURO, 'Tipo logradouro');
  preencherSelect(document.querySelector('#imovelForm select[name="uf"]'), UFS, 'UF');
  preencherSelect(document.querySelector('#interesseForm select[name="uf"]'), UFS, 'UF');
}

document.querySelectorAll('.tab').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.remove('active'));
    document.querySelectorAll('.panel').forEach((panel) => panel.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(button.dataset.tab).classList.add('active');
  });
});

const refreshButton = document.getElementById('refreshAll');

async function refreshData() {
  refreshButton.disabled = true;
  refreshButton.textContent = 'Atualizando...';
  try {
    await loadClientes();
    populateClienteSelects();
    await loadImoveis();
    populateImovelSelects();
    await loadVisitas();
  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = 'Atualizar dados';
  }
}

refreshButton.addEventListener('click', () => handleAction(refreshData));
document.getElementById('applyFilters').addEventListener('click', () => handleAction(loadImoveis));
document.getElementById('runQueries').addEventListener('click', () => handleAction(runQueries));

// Formulario Cliente
document.getElementById('clienteForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  await handleAction(async () => {
    const form = new FormData(event.currentTarget);
    const tipo = form.getAll('tipo');
    if (tipo.length === 0) {
      alert('Selecione pelo menos um tipo de cliente.');
      return;
    }
    await api('/api/clientes', {
      method: 'POST',
      body: {
        nome: form.get('nome'),
        telefone: form.get('telefone'),
        email: form.get('email'),
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
        tipo
      }
    });
    event.currentTarget.reset();
    await refreshData();
  });
});

// Formulario Interesse
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

// Formulario Imovel
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
    await refreshData();
  });
});

// Formulario Visita
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

carregarOpcoesFixas();
handleAction(refreshData);
