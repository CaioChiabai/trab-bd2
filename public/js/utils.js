export function money(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function escapeHtml(value) {
  if (value == null) return '';
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}

export function fillSelect(select, items, placeholder, labelFn = (item) => item.nome) {
  const current = select.value;
  select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;
  items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item._id;
    option.textContent = labelFn(item);
    select.appendChild(option);
  });
  if (current && items.some(i => i._id === current)) {
    select.value = current;
  }
}

export function preencherSelect(select, options, placeholder) {
  const current = select.value;
  select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>`;
  options.forEach(optionValue => {
    const option = document.createElement('option');
    option.value = optionValue;
    option.textContent = optionValue;
    select.appendChild(option);
  });
  if (current && options.includes(current)) {
    select.value = current;
  }
}

export async function handleAction(action) {
  try {
    await action();
  } catch (error) {
    console.error(error);
  }
}
