export function buildImoveisFindQuery(params = {}) {
  const query = {};

  if (params.disponiveis === 'true') query.ocupado = false;
  if (params.tipo) query.tipo = String(params.tipo).toLowerCase();

  // Utilizando regex para buscas parciais sem case sensitivity
  if (params.cidade) query['endereco.cidade'] = new RegExp(escapeRegExp(params.cidade), 'i');
  if (params.bairro) query['endereco.bairro'] = new RegExp(escapeRegExp(params.bairro), 'i');
  if (params.uf) query['endereco.uf'] = String(params.uf).toUpperCase();

  // Range de Preços
  if (params.preco_min || params.preco_max) {
    query.preco = {};
    if (params.preco_min) query.preco.$gte = Number(params.preco_min);
    if (params.preco_max) query.preco.$lte = Number(params.preco_max);
  }

  // Novo: Range de Datas (Construção)
  if (params.data_inicio || params.data_fim) {
    query.data_construcao = {};
    if (params.data_inicio) query.data_construcao.$gte = new Date(params.data_inicio);
    if (params.data_fim) query.data_construcao.$lte = new Date(params.data_fim);
  }

  return query;
}

export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Monta uma string legível a partir do objeto endereco, evitando que
// campos ausentes quebrem o $concat (que retorna null se algum operando for null)
function enderecoConcatExpr(prefixoCampo) {
  return {
    $concat: [
      { $ifNull: [`$${prefixoCampo}.bairro`, ''] },
      ', ',
      { $ifNull: [`$${prefixoCampo}.cidade`, ''] },
      ' - ',
      { $ifNull: [`$${prefixoCampo}.uf`, ''] }
    ]
  };
}

export const pipelines = {
  compradoresComInteresses: [
    { $match: { tipo: 'comprador', interesses: { $exists: true, $ne: [] } } },
    {
      // Em vez de listar o conteúdo de "interesses" (array de objetos),
      // mostramos apenas a quantidade de itens com $size
      $project: {
        nome: 1,
        endereco: 1,
        telefone: 1,
        email: 1,
        tipo: 1,
        numero_interesses: { $size: '$interesses' }
      }
    },
    { $sort: { nome: 1 } }
  ],
  imoveisPorTipo: [
    { $group: { _id: '$tipo', quantidade: { $sum: 1 } } },
    { $sort: { quantidade: -1, _id: 1 } }
  ],
  precoMedioPorLocalidade: [
    {
      $group: {
        _id: {
          cidade: '$endereco.cidade',
          bairro: '$endereco.bairro',
          uf: '$endereco.uf'
        },
        preco_medio: { $avg: '$preco' },
        menor_preco: { $min: '$preco' },
        maior_preco: { $max: '$preco' },
        quantidade: { $sum: 1 }
      }
    },
    { $sort: { '_id.uf': 1, '_id.cidade': 1, '_id.bairro': 1 } }
  ],
  imoveisComVendedor: [
    {
      $lookup: {
        from: 'clientes',
        localField: 'dono_id',
        foreignField: '_id',
        as: 'vendedor'
      }
    },
    { $unwind: '$vendedor' },
    {
      $project: {
        tipo: 1,
        // Antes: endereco: 1 (objeto inteiro -> aparecia como [object Object] na tabela)
        endereco: enderecoConcatExpr('endereco'),
        preco: 1,
        ocupado: 1,
        data_construcao: 1,
        vendedor: {
          _id: '$vendedor._id',
          nome: '$vendedor.nome',
          telefone: '$vendedor.telefone',
          email: '$vendedor.email'
        }
      }
    },
    { $sort: { preco: 1 } }
  ],
  visitasComClienteEImovel: [
    {
      $lookup: {
        from: 'clientes',
        localField: 'cliente_id',
        foreignField: '_id',
        as: 'cliente'
      }
    },
    { $unwind: '$cliente' },
    {
      $lookup: {
        from: 'imoveis',
        localField: 'imovel_id',
        foreignField: '_id',
        as: 'imovel'
      }
    },
    { $unwind: '$imovel' },
    {
      $project: {
        data_hora: 1,
        observacao: 1,
        cliente: {
          _id: '$cliente._id',
          nome: '$cliente.nome',
          telefone: '$cliente.telefone',
          email: '$cliente.email'
        },
        imovel: {
          _id: '$imovel._id',
          tipo: '$imovel.tipo',
          // Antes: endereco: '$imovel.endereco' (objeto inteiro)
          endereco: enderecoConcatExpr('imovel.endereco'),
          preco: '$imovel.preco'
        }
      }
    },
    { $sort: { data_hora: -1 } }
  ],
  precoMinMax: [
    {
      $group: {
        _id: null,
        menor_preco: { $min: '$preco' },
        maior_preco: { $max: '$preco' },
        preco_medio: { $avg: '$preco' },
        quantidade: { $sum: 1 }
      }
    },
    { $project: { _id: 0 } }
  ],
  visitasPorImovel: [
    { $group: { _id: '$imovel_id', total_visitas: { $sum: 1 }, ultima_visita: { $max: '$data_hora' } } },
    {
      $lookup: {
        from: 'imoveis',
        localField: '_id',
        foreignField: '_id',
        as: 'imovel'
      }
    },
    { $unwind: '$imovel' },
    {
      $project: {
        total_visitas: 1,
        ultima_visita: 1,
        imovel: {
          _id: '$imovel._id',
          tipo: '$imovel.tipo',
          // Antes: endereco: '$imovel.endereco' (objeto inteiro)
          endereco: enderecoConcatExpr('imovel.endereco'),
          preco: '$imovel.preco'
        }
      }
    },
    { $sort: { total_visitas: -1 } }
  ],
  imoveisPorVendedor: [
    { $group: { _id: '$dono_id', quantidade_imoveis: { $sum: 1 } } },
    {
      $lookup: {
        from: 'clientes',
        localField: '_id',
        foreignField: '_id',
        as: 'vendedor'
      }
    },
    { $unwind: '$vendedor' },
    {
      $project: {
        quantidade_imoveis: 1,
        vendedor: {
          _id: '$vendedor._id',
          nome: '$vendedor.nome',
          email: '$vendedor.email'
        }
      }
    },
    { $sort: { quantidade_imoveis: -1, 'vendedor.nome': 1 } }
  ]
};