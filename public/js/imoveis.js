import { api } from './api.js';
import { state, endpoints, editingState } from './state.js';
import { renderItem } from './components.js';
import { money, fillSelect, preencherSelect } from './utils.js';
import { TIPOS_IMOVEL, TIPOS_LOGRADOURO, UFS } from '/constants.js';

export async function loadImoveis() {
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
  renderImoveisList();
}

export function populateImovelSelects() {
  fillSelect(
    document.querySelector('#visitaForm select[name="imovel_id"]'),
    state.imoveis,
    'Selecione o imóvel',
    (imovel) => `${imovel.tipo} - ${imovel.endereco.bairro} - ${money(imovel.preco)}`
  );
}

export function renderImoveisList() {
  const list = document.getElementById('imoveisList');
  list.innerHTML = '';

  state.imoveis.forEach((imovel) => {
    if (editingState.imovelId === imovel._id) {
      list.appendChild(renderImovelEditor(imovel));
      return;
    }

    const vendedor = state.clientes.find((c) => c._id === imovel.dono_id);
    const end = imovel.endereco;
    const enderecoFormatado = `${end.tipo_logradouro} ${end.logradouro}, ${end.numero}${end.complemento ? ' - ' + end.complemento : ''} - ${end.bairro}, ${end.cidade}/${end.uf}`;

    const badges = [];
    badges.push({ text: imovel.ocupado ? 'Ocupado' : 'Disponível', type: imovel.ocupado ? 'danger' : 'success' });
    badges.push({ text: imovel.tipo, type: 'primary' });

    list.appendChild(
      renderItem({
        title: `${money(imovel.preco)}`,
        badges,
        lines: [
          `📍 ${enderecoFormatado}`,
          `🏢 Vendedor: ${vendedor?.nome || imovel.dono_id}`,
          `📅 Construção: ${new Date(imovel.data_construcao).toLocaleDateString('pt-BR')}`
        ],
        onEdit: () => {
          editingState.imovelId = imovel._id;
          renderImoveisList();
        },
        onDelete: async () => {
          await api(`${endpoints.imoveis}/${imovel._id}`, { method: 'DELETE' });
          await loadImoveis();
        }
      })
    );
  });
}

function renderImovelEditor(imovel) {
  const form = document.createElement('form');
  form.className = 'form-card form-grid';

  const dataConstrucao = new Date(imovel.data_construcao).toISOString().split('T')[0];

  form.innerHTML = `
    <select name="tipo" required></select>
    <select name="dono_id" required></select>
    <input name="preco" type="number" min="1" value="${imovel.preco}" placeholder="Preço" required>
    <input name="data_construcao" type="date" value="${dataConstrucao}" required>
    
    <select name="tipo_logradouro" required></select>
    <input name="logradouro" value="${imovel.endereco.logradouro}" placeholder="Logradouro" required>
    <input name="numero" value="${imovel.endereco.numero}" placeholder="Número" required>
    <input name="complemento" value="${imovel.endereco.complemento || ''}" placeholder="Complemento">
    
    <input name="bairro" value="${imovel.endereco.bairro}" placeholder="Bairro" required>
    <input name="cidade" value="${imovel.endereco.cidade}" placeholder="Cidade" required>
    <select name="uf" required></select>
    <input name="cep" value="${imovel.endereco.cep}" placeholder="CEP" required>
    
    <label class="check-group" style="grid-column: 1 / -1; border-top: 1px dashed var(--color-border); padding-top: var(--spacing-sm);">
      <input type="checkbox" name="ocupado" ${imovel.ocupado ? 'checked' : ''}>
      Imóvel está Ocupado
    </label>
  `;

  // Preencher selects
  const selectTipo = form.querySelector('select[name="tipo"]');
  const selectDono = form.querySelector('select[name="dono_id"]');
  const selectTipoLogr = form.querySelector('select[name="tipo_logradouro"]');
  const selectUF = form.querySelector('select[name="uf"]');

  // Adicionamos as opcoes de vendedor para o dono_id
  const vendedores = state.clientes.filter((c) => (c.tipo || []).includes('vendedor'));

  setTimeout(() => {
    preencherSelect(selectTipo, TIPOS_IMOVEL, 'Tipo do imóvel');
    selectTipo.value = imovel.tipo;

    fillSelect(selectDono, vendedores, 'Selecione o vendedor');
    selectDono.value = imovel.dono_id;

    preencherSelect(selectTipoLogr, TIPOS_LOGRADOURO, 'Tipo logradouro');
    selectTipoLogr.value = imovel.endereco.tipo_logradouro;

    preencherSelect(selectUF, UFS, 'UF');
    selectUF.value = imovel.endereco.uf;
  }, 0);

  const actions = document.createElement('div');
  actions.style.gridColumn = '1 / -1';
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.marginTop = '16px';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.className = 'primary';
  saveBtn.textContent = 'Salvar Imóvel';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'secondary';
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.onclick = () => {
    editingState.imovelId = null;
    renderImoveisList();
  };

  actions.appendChild(saveBtn);
  actions.appendChild(cancelBtn);
  form.appendChild(actions);

  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    await api(`${endpoints.imoveis}/${imovel._id}`, {
      method: 'PUT',
      body: {
        tipo: formData.get('tipo'),
        dono_id: formData.get('dono_id'),
        preco: Number(formData.get('preco')),
        data_construcao: formData.get('data_construcao'),
        ocupado: formData.get('ocupado') === 'on',
        endereco: {
          ...imovel.endereco,
          tipo_logradouro: formData.get('tipo_logradouro'),
          logradouro: formData.get('logradouro'),
          numero: formData.get('numero'),
          complemento: formData.get('complemento'),
          bairro: formData.get('bairro'),
          cidade: formData.get('cidade'),
          uf: formData.get('uf'),
          cep: formData.get('cep')
        }
      }
    });

    editingState.imovelId = null;
    await loadImoveis();
  };

  return form;
}
