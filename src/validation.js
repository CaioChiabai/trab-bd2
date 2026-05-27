import {
  TIPOS_LOGRADOURO,
  UFS,
  TIPOS_IMOVEL
} from './constants.js';

const tiposCliente = new Set(['vendedor', 'comprador']);

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function validateEnum(value, allowed, field) {
  if (!allowed.includes(value)) {
    throw badRequest(
      `${field} inválido. Valores permitidos: ${allowed.join(', ')}`
    );
  }

  return value;
}

export function assertRequired(body, fields) {
  const missing = fields.filter(
    (field) =>
      body[field] === undefined ||
      body[field] === null ||
      body[field] === ''
  );

  if (missing.length > 0) {
    throw badRequest(
      `Campos obrigatorios ausentes: ${missing.join(', ')}`
    );
  }
}

function parseBoolean(value) {
  if (typeof value === 'boolean') return value;

  if (value === 'true') return true;
  if (value === 'false') return false;

  return Boolean(value);
}

function normalizeEndereco(endereco) {
  assertRequired(endereco || {}, [
    'tipo_logradouro',
    'logradouro',
    'numero',
    'bairro',
    'cep',
    'cidade',
    'uf'
  ]);

  return {
    tipo_logradouro: validateEnum(
      String(endereco.tipo_logradouro).trim(),
      TIPOS_LOGRADOURO,
      'tipo_logradouro'
    ),

    logradouro: String(endereco.logradouro).trim(),

    numero: String(endereco.numero).trim(),

    complemento: endereco.complemento
      ? String(endereco.complemento).trim()
      : '',

    bairro: String(endereco.bairro).trim(),

    cep: String(endereco.cep).trim(),

    cidade: String(endereco.cidade).trim(),

    uf: validateEnum(
      String(endereco.uf).trim().toUpperCase(),
      UFS,
      'uf'
    )
  };
}

export function normalizeCliente(body, partial = false) {
  const cliente = {};

  if (!partial) {
    assertRequired(body, [
      'nome',
      'endereco',
      'telefone',
      'email',
      'tipo'
    ]);
  }

  if (body.nome !== undefined) {
    cliente.nome = String(body.nome).trim();
  }

  if (body.endereco !== undefined) {
    cliente.endereco = normalizeEndereco(body.endereco);
  }

  if (body.telefone !== undefined) {
    cliente.telefone = String(body.telefone).trim();
  }

  if (body.email !== undefined) {
    cliente.email = String(body.email)
      .trim()
      .toLowerCase();
  }

  if (body.tipo !== undefined) {
    const tipo = Array.isArray(body.tipo)
      ? body.tipo
      : [body.tipo];

    const invalidos = tipo.filter(
      (item) => !tiposCliente.has(item)
    );

    if (tipo.length === 0 || invalidos.length > 0) {
      throw badRequest(
        'tipo deve conter vendedor, comprador ou ambos'
      );
    }

    cliente.tipo = [...new Set(tipo)];
  }

  if (body.interesses !== undefined) {
    if (!Array.isArray(body.interesses)) {
      throw badRequest('interesses deve ser uma lista');
    }

    cliente.interesses = body.interesses.map(
      normalizeInteresse
    );
  } else if (!partial) {
    cliente.interesses = [];
  }

  return cliente;
}

export function normalizeInteresse(body) {
  assertRequired(body, [
    'quartos',
    'tamanho_min_m2',
    'area_lazer',
    'bairro',
    'cidade',
    'uf',
    'valor_maximo'
  ]);

  return {
    quartos: Number(body.quartos),

    tamanho_min_m2: Number(body.tamanho_min_m2),

    area_lazer: parseBoolean(body.area_lazer),

    bairro: String(body.bairro).trim(),

    cidade: String(body.cidade).trim(),

    uf: validateEnum(
      String(body.uf).trim().toUpperCase(),
      UFS,
      'uf'
    ),

    valor_maximo: Number(body.valor_maximo)
  };
}

export function normalizeImovel(body, partial = false) {
  const imovel = {};

  if (!partial) {
    assertRequired(body, [
      'tipo',
      'endereco',
      'preco',
      'data_construcao',
      'ocupado',
      'dono_id'
    ]);
  }

  if (body.tipo !== undefined) {
    imovel.tipo = validateEnum(
      String(body.tipo).trim(),
      TIPOS_IMOVEL,
      'tipo'
    );
  }

  if (body.endereco !== undefined) {
    imovel.endereco = normalizeEndereco(body.endereco);
  }

  if (body.preco !== undefined) {
    imovel.preco = Number(body.preco);
  }

  if (body.data_construcao !== undefined) {
    imovel.data_construcao = new Date(
      body.data_construcao
    );
  }

  if (body.ocupado !== undefined) {
    imovel.ocupado = parseBoolean(body.ocupado);
  }

  if (body.dono_id !== undefined) {
    imovel.dono_id = body.dono_id;
  }

  return imovel;
}

export function normalizeVisita(body, partial = false) {
  const visita = {};

  if (!partial) {
    assertRequired(body, [
      'imovel_id',
      'cliente_id',
      'data_hora'
    ]);
  }

  if (body.imovel_id !== undefined) {
    visita.imovel_id = body.imovel_id;
  }

  if (body.cliente_id !== undefined) {
    visita.cliente_id = body.cliente_id;
  }

  if (body.data_hora !== undefined) {
    visita.data_hora = new Date(body.data_hora);
  }

  if (body.observacao !== undefined) {
    visita.observacao = String(body.observacao).trim();
  }

  return visita;
}