import { escapeHtml, money } from './utils.js';

export function renderItem({ title, lines, badges = [], onDelete, onEdit }) {
  const article = document.createElement('article');
  article.className = 'item-card';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'item-content';

  const titleRow = document.createElement('div');
  titleRow.style.display = 'flex';
  titleRow.style.justifyContent = 'space-between';
  titleRow.style.alignItems = 'flex-start';
  titleRow.style.marginBottom = '8px';

  const titleEl = document.createElement('h3');
  titleEl.className = 'item-title';
  titleEl.textContent = title;
  
  titleRow.appendChild(titleEl);

  if (badges.length > 0) {
    const badgesDiv = document.createElement('div');
    badgesDiv.style.display = 'flex';
    badgesDiv.style.gap = '4px';
    badges.forEach(b => {
      const badgeSpan = document.createElement('span');
      badgeSpan.className = `badge bg-${b.type || 'info'}`;
      badgeSpan.textContent = b.text;
      badgesDiv.appendChild(badgeSpan);
    });
    titleRow.appendChild(badgesDiv);
  }

  contentDiv.appendChild(titleRow);

  const detailsDiv = document.createElement('div');
  detailsDiv.className = 'item-details';
  lines.forEach(line => {
    const p = document.createElement('p');
    p.innerHTML = escapeHtml(line).replace(/\n/g, '<br>');
    detailsDiv.appendChild(p);
  });
  contentDiv.appendChild(detailsDiv);

  article.appendChild(contentDiv);

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'item-actions';

  if (onEdit) {
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'secondary';
    editBtn.textContent = 'Editar';
    editBtn.onclick = onEdit;
    actionsDiv.appendChild(editBtn);
  }

  if (onDelete) {
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'danger';
    delBtn.textContent = 'Excluir';
    delBtn.onclick = () => {
      if (confirm(`Tem certeza que deseja excluir "${title}"?`)) {
        onDelete();
      }
    };
    actionsDiv.appendChild(delBtn);
  }

  article.appendChild(actionsDiv);
  return article;
}

export function renderGenericTable(data) {
  const container = document.createElement('div');
  container.className = 'table-container';

  const table = document.createElement('table');
  table.className = 'data-table';
  
  const headers = Object.keys(data[0]);
  
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = headers.map(key => {
      let val = row[key];
      
      if (typeof val === 'boolean') {
        return `<td><span class="badge ${val ? 'bg-success' : 'bg-danger'}">${val ? 'Sim' : 'Não'}</span></td>`;
      }
      
      if (typeof val === 'object' && val !== null) {
        val = Object.values(val).map(v => {
          if (typeof v === 'string' && v.length === 24 && /^[0-9a-fA-F]{24}$/.test(v)) {
            return v.substring(18).toUpperCase();
          }
          return v;
        }).join(' - '); 
      }

      if (typeof val === 'string' && val.length === 24 && /^[0-9a-fA-F]{24}$/.test(val)) {
        val = val.substring(18).toUpperCase();
      }

      if (key.includes('preco') || key.includes('valor')) {
        val = money(val);
      } else if (key.includes('data') && val && !isNaN(Date.parse(val))) {
        val = new Date(val).toLocaleDateString('pt-BR');
      }
      
      return `<td>${escapeHtml(String(val))}</td>`;
    }).join('');
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
  return container;
}
