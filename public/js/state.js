export const state = {
  clientes: [],
  imoveis: [],
  visitas: []
};

export const editingState = {
  clienteId: null,
  imovelId: null,
  visitaId: null,
  interesseClienteId: null,
  interesseIndex: null
};

export const endpoints = {
  clientes: '/api/clientes',
  imoveis: '/api/imoveis',
  visitas: '/api/visitas'
};
