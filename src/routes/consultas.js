import { Router } from 'express';
import { asyncRoute } from '../async-route.js';
import { collections } from '../db.js';
import { buildImoveisFindQuery, pipelines } from '../queries.js';

export function consultasRouter(db) {
  const router = Router();
  const { clientes, imoveis, visitas } = collections(db);

  router.get('/find/imoveis', asyncRoute(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const query = buildImoveisFindQuery(req.query);

  const [data, total] = await Promise.all([
    imoveis.find(query).sort({ preco: 1 }).skip(skip).limit(limit).toArray(),
    imoveis.countDocuments(query)
  ]);

  res.json({
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
}));

  router.get('/find/imoveis', asyncRoute(async (req, res) => {
  // 1. Extrair paginação (padrão: página 1, 10 itens por página)
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.max(1, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const query = buildImoveisFindQuery(req.query);

  // 2. Executar contagem e busca paralelamente para otimizar performance
  const [data, total] = await Promise.all([
    imoveis.find(query).sort({ preco: 1 }).skip(skip).limit(limit).toArray(),
    imoveis.countDocuments(query)
  ]);

  // 3. Retornar um envelope com os dados e paginação
  res.json({
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
}));

  router.get('/find/compradores-com-interesses', asyncRoute(async (_req, res) => {
    const data = await clientes.find({ tipo: 'comprador', interesses: { $exists: true, $ne: [] } }).sort({ nome: 1 }).toArray();
    res.json(data);
  }));

  router.get('/aggregate/imoveis-por-tipo', asyncRoute(async (_req, res) => {
    res.json(await imoveis.aggregate(pipelines.imoveisPorTipo).toArray());
  }));

  router.get('/aggregate/preco-medio-localidade', asyncRoute(async (_req, res) => {
    res.json(await imoveis.aggregate(pipelines.precoMedioPorLocalidade).toArray());
  }));

  router.get('/aggregate/imoveis-com-vendedor', asyncRoute(async (_req, res) => {
    res.json(await imoveis.aggregate(pipelines.imoveisComVendedor).toArray());
  }));

  router.get('/aggregate/visitas-com-cliente-imovel', asyncRoute(async (_req, res) => {
    res.json(await visitas.aggregate(pipelines.visitasComClienteEImovel).toArray());
  }));

  router.get('/aggregate/preco-min-max', asyncRoute(async (_req, res) => {
    res.json(await imoveis.aggregate(pipelines.precoMinMax).toArray());
  }));

  router.get('/aggregate/visitas-por-imovel', asyncRoute(async (_req, res) => {
    res.json(await visitas.aggregate(pipelines.visitasPorImovel).toArray());
  }));

  router.get('/aggregate/imoveis-por-vendedor', asyncRoute(async (_req, res) => {
    res.json(await imoveis.aggregate(pipelines.imoveisPorVendedor).toArray());
  }));

  return router;
}
