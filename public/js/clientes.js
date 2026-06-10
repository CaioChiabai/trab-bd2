import { api } from './api.js';
import { state, endpoints, editingState } from './state.js';
import { renderItem } from './components.js';
import { escapeHtml, fillSelect, handleAction, preencherSelect } from './utils.js';
import { TIPOS_LOGRADOURO, UFS } from '/constants.js';

export async function loadClientes() {
  state.clientes = await api(endpoints.clientes);
  document.getElementById('clientesCount').textContent = state.clientes.length;
  renderClientesList();
}

export function populateClienteSelects() {
  const vendedores = state.clientes.filter((c) => (c.tipo || []).includes('vendedor'));
  const compradores = state.clientes.filter((c) => (c.tipo || []).includes('comprador'));

  fillSelect(document.querySelector('#imovelForm select[name="dono_id"]'), vendedores, 'Selecione o vendedor');
  fillSelect(document.querySelector('#interesseForm select[name="cliente_id"]'), compradores, 'Selecione o comprador');
  fillSelect(document.querySelector('#visitaForm select[name="cliente_id"]'), compradores, 'Selecione o comprador');
}

export function renderClientesList() {
  const list = document.getElementById('clientesList');
  list.innerHTML = '';

  state.clientes.forEach((cliente) => {
    if (editingState.clienteId === cliente._id) {
      list.appendChild(renderClienteEditor(cliente));
      return;
    }

    const badges = (cliente.tipo || []).map(t => ({
      text: t, type: t === 'vendedor' ? 'success' : 'info'
    }));

    const end = cliente.endereco;
    const enderecoFormatado = `${end.tipo_logradouro} ${end.logradouro}, ${end.numero}${end.complemento ? ' - ' + end.complemento : ''} - ${end.bairro}, ${end.cidade}/${end.uf}`;

    const card = renderItem({
      title: cliente.nome,
      badges,
      lines: [
        `📧 ${cliente.email} | 📞 ${cliente.telefone}`,
        `📍 ${enderecoFormatado}`,
        `🎯 Interesses registrados: ${cliente.interesses?.length || 0}`
      ],
      onEdit: () => {
        editingState.clienteId = cliente._id;
        renderClientesList();
      },
      onDelete: async () => {
        await api(`${endpoints.clientes}/${cliente._id}`, { method: 'DELETE' });
        await loadClientes();
      }
    });

    const actions = card.querySelector('.item-actions');
    
    (cliente.interesses || []).forEach((interesse, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'secondary';
      btn.style.fontSize = '0.75rem';
      btn.style.padding = '4px 8px';
      btn.textContent = `Editar Interesse ${index + 1}`;
      btn.onclick = () => {
        editingState.interesseClienteId = cliente._id;
        editingState.interesseIndex = index;
        renderClientesList();
      };
      actions.appendChild(btn);
    });

    list.appendChild(card);

    (cliente.interesses || []).forEach((interesse, index) => {
      if (editingState.interesseClienteId === cliente._id && editingState.interesseIndex === index) {
        list.appendChild(renderInteresseEditor(cliente, interesse, index));
      }
    });
  });
}

function renderClienteEditor(cliente) {
  const form = document.createElement('form');
  form.className = 'form-card form-grid';
  
  form.innerHTML = `
    <input name="nome" value="${cliente.nome}" placeholder="Nome" required>
    <input name="telefone" value="${cliente.telefone}" placeholder="Telefone" required>
    <input name="email" type="email" value="${cliente.email}" placeholder="E-mail" required>
    
    <select name="tipo_logradouro" required></select>
    <input name="logradouro" value="${cliente.endereco.logradouro}" placeholder="Logradouro" required>
    <input name="numero" value="${cliente.endereco.numero}" placeholder="Número" required>
    <input name="complemento" value="${cliente.endereco.complemento || ''}" placeholder="Complemento">
    
    <input name="bairro" value="${cliente.endereco.bairro}" placeholder="Bairro" required>
    <input name="cidade" value="${cliente.endereco.cidade}" placeholder="Cidade" required>
    <select name="uf" required></select>
    <input name="cep" value="${cliente.endereco.cep}" placeholder="CEP" required>
  `;

  const selectTipoLogr = form.querySelector('select[name="tipo_logradouro"]');
  const selectUF = form.querySelector('select[name="uf"]');

  setTimeout(() => {
    preencherSelect(selectTipoLogr, TIPOS_LOGRADOURO, 'Tipo logradouro');
    selectTipoLogr.value = cliente.endereco.tipo_logradouro;

    preencherSelect(selectUF, UFS, 'UF');
    selectUF.value = cliente.endereco.uf;
  }, 0);

  const actions = document.createElement('div');
  actions.style.gridColumn = '1 / -1';
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.marginTop = '16px';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.className = 'primary';
  saveBtn.textContent = 'Salvar Cliente';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'secondary';
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.onclick = () => {
    editingState.clienteId = null;
    renderClientesList();
  };

  actions.appendChild(saveBtn);
  actions.appendChild(cancelBtn);
  form.appendChild(actions);

  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    await api(`${endpoints.clientes}/${cliente._id}`, {
      method: 'PUT',
      body: {
        nome: formData.get('nome'),
        telefone: formData.get('telefone'),
        email: formData.get('email'),
        endereco: {
          ...cliente.endereco,
          tipo_logradouro: formData.get('tipo_logradouro'),
          logradouro: formData.get('logradouro'),
          numero: formData.get('numero'),
          complemento: formData.get('complemento'),
          bairro: formData.get('bairro'),
          cidade: formData.get('cidade'),
          uf: formData.get('uf'),
          cep: formData.get('cep')
        },
        tipo: cliente.tipo
      }
    });

    editingState.clienteId = null;
    await loadClientes();
  };

  return form;
}

function renderInteresseEditor(cliente, interesse, index) {
  const form = document.createElement('form');
  form.className = 'form-card form-grid compact';
  
  form.innerHTML = `
    <input name="quartos" type="number" value="${interesse.quartos}" placeholder="Quartos" required>
    <input name="tamanho_min_m2" type="number" value="${interesse.tamanho_min_m2}" placeholder="Tamanho Mín. (m²)" required>
    <input name="bairro" value="${escapeHtml(interesse.bairro)}" placeholder="Bairro" required>
    <input name="cidade" value="${escapeHtml(interesse.cidade)}" placeholder="Cidade" required>
    <select name="uf" required></select>
    <input name="valor_maximo" type="number" value="${interesse.valor_maximo}" placeholder="Valor Máximo" required>
    <label class="check-group">
      <input type="checkbox" name="area_lazer" ${interesse.area_lazer ? 'checked' : ''}>
      Área de lazer
    </label>
  `;

  const selectUF = form.querySelector('select[name="uf"]');
  setTimeout(() => {
    preencherSelect(selectUF, UFS, 'UF');
    selectUF.value = interesse.uf;
  }, 0);

  const actions = document.createElement('div');
  actions.style.gridColumn = '1 / -1';
  actions.style.display = 'flex';
  actions.style.gap = '8px';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.className = 'primary';
  saveBtn.textContent = 'Salvar Interesse';

  const delBtn = document.createElement('button');
  delBtn.type = 'button';
  delBtn.className = 'danger';
  delBtn.textContent = 'Excluir Interesse';
  delBtn.onclick = async () => {
    if(confirm('Excluir este interesse?')) {
      await api(`${endpoints.clientes}/${cliente._id}/interesses/${index}`, { method: 'DELETE' });
      editingState.interesseClienteId = null;
      editingState.interesseIndex = null;
      await loadClientes();
    }
  };

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'secondary';
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.onclick = () => {
    editingState.interesseClienteId = null;
    editingState.interesseIndex = null;
    renderClientesList();
  };

  actions.appendChild(saveBtn);
  actions.appendChild(delBtn);
  actions.appendChild(cancelBtn);
  form.appendChild(actions);

  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    await api(`${endpoints.clientes}/${cliente._id}/interesses/${index}`, {
      method: 'PUT',
      body: {
        quartos: Number(formData.get('quartos')),
        tamanho_min_m2: Number(formData.get('tamanho_min_m2')),
        bairro: formData.get('bairro'),
        cidade: formData.get('cidade'),
        uf: formData.get('uf'),
        valor_maximo: Number(formData.get('valor_maximo')),
        area_lazer: formData.get('area_lazer') === 'on'
      }
    });
    editingState.interesseClienteId = null;
    editingState.interesseIndex = null;
    await loadClientes();
  };

  return form;
}
