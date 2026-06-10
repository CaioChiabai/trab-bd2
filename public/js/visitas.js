import { api } from './api.js';
import { state, endpoints, editingState } from './state.js';
import { renderItem } from './components.js';

export async function loadVisitas() {
  state.visitas = await api(endpoints.visitas);
  document.getElementById('visitasCount').textContent = state.visitas.length;
  renderVisitasList();
}

export function renderVisitasList() {
  const list = document.getElementById('visitasList');
  list.innerHTML = '';

  state.visitas.forEach((visita) => {
    const cliente = state.clientes.find(c => c._id === visita.cliente_id);
    const imovel = state.imoveis.find(i => i._id === visita.imovel_id);

    if (editingState.visitaId === visita._id) {
      list.appendChild(renderVisitaEditor(visita, cliente, imovel));
      return;
    }

    const dataFormatada = new Date(visita.data_hora).toLocaleString('pt-BR');

    list.appendChild(
      renderItem({
        title: `${cliente?.nome || 'Cliente Desconhecido'} visitou ${imovel?.tipo || 'Imóvel Desconhecido'}`,
        lines: [
          `📅 Data e Hora: ${dataFormatada}`,
          `📝 Observação: ${visita.observacao || 'Sem observação'}`
        ],
        onEdit: () => {
          editingState.visitaId = visita._id;
          renderVisitasList();
        },
        onDelete: async () => {
          await api(`${endpoints.visitas}/${visita._id}`, { method: 'DELETE' });
          await loadVisitas();
        }
      })
    );
  });
}

function renderVisitaEditor(visita, cliente, imovel) {
  const form = document.createElement('form');
  form.className = 'form-card form-grid';

  const dataHora = new Date(visita.data_hora).toISOString().slice(0, 16);

  form.innerHTML = `
    <div style="grid-column: 1 / -1; margin-bottom: 8px;">
      <strong>Cliente:</strong> ${cliente?.nome || 'Desconhecido'}<br>
      <strong>Imóvel:</strong> ${imovel?.tipo || 'Desconhecido'} - ${imovel?.endereco?.bairro || ''}
    </div>
    <input name="data_hora" type="datetime-local" value="${dataHora}" required>
    <input name="observacao" value="${visita.observacao || ''}" placeholder="Observação" style="grid-column: 1 / -1">
  `;

  const actions = document.createElement('div');
  actions.style.gridColumn = '1 / -1';
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.marginTop = '16px';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'submit';
  saveBtn.className = 'primary';
  saveBtn.textContent = 'Salvar Visita';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'secondary';
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.onclick = () => {
    editingState.visitaId = null;
    renderVisitasList();
  };

  actions.appendChild(saveBtn);
  actions.appendChild(cancelBtn);
  form.appendChild(actions);

  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    await api(`${endpoints.visitas}/${visita._id}`, {
      method: 'PUT',
      body: {
        cliente_id: visita.cliente_id,
        imovel_id: visita.imovel_id,
        data_hora: formData.get('data_hora'),
        observacao: formData.get('observacao')
      }
    });

    editingState.visitaId = null;
    await loadVisitas();
  };

  return form;
}
