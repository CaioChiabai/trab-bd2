import { Router } from 'express';
import { asyncRoute } from '../async-route.js';
import { collections } from '../db.js';
import { buildImoveisFindQuery, pipelines } from '../queries.js';

export function consultasRouter(db) {
  const router = Router();
  const { clientes, imoveis, visitas } = collections(db);

  router.get('/find/imoveis-disponiveis', asyncRoute(async (_req, res) => {
    const data = await imoveis.find({ ocupado: false }).sort({ preco: 1 }).toArray();
    res.json(data);
  }));

  router.get('/find/imoveis', asyncRoute(async (req, res) => {
    const data = await imoveis.find(buildImoveisFindQuery(req.query)).sort({ preco: 1 }).toArray();
    res.json(data);
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
