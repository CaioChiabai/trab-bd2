import assert from 'node:assert/strict';
import test from 'node:test';
import { buildImoveisFindQuery, escapeRegExp, pipelines } from '../src/queries.js';

test('buildImoveisFindQuery monta filtros por disponibilidade, tipo, localidade e preco', () => {
  const query = buildImoveisFindQuery({
    disponiveis: 'true',
    tipo: 'Apartamento',
    cidade: 'Belo Horizonte',
    bairro: 'Centro',
    uf: 'mg',
    preco_min: '200000',
    preco_max: '500000'
  });

  assert.equal(query.ocupado, false);
  assert.equal(query.tipo, 'apartamento');
  assert.equal(query['endereco.uf'], 'MG');
  assert.deepEqual(query.preco, { $gte: 200000, $lte: 500000 });
  assert.equal(query['endereco.cidade'].test('Belo Horizonte'), true);
  assert.equal(query['endereco.bairro'].test('Centro'), true);
});

test('escapeRegExp impede metacaracteres em busca textual', () => {
  assert.equal(escapeRegExp('Centro.*'), 'Centro\\.\\*');
});

test('pipelines contem consultas agregadas obrigatorias', () => {
  assert.ok(Array.isArray(pipelines.imoveisPorTipo));
  assert.ok(Array.isArray(pipelines.precoMedioPorLocalidade));
  assert.ok(Array.isArray(pipelines.imoveisComVendedor));
  assert.ok(Array.isArray(pipelines.visitasComClienteEImovel));
  assert.ok(Array.isArray(pipelines.precoMinMax));
  assert.ok(Array.isArray(pipelines.visitasPorImovel));
  assert.ok(Array.isArray(pipelines.imoveisPorVendedor));
});
