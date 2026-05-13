import { Router } from 'express';
import { asyncRoute } from '../async-route.js';
import { collections, toObjectId } from '../db.js';
import { buildImoveisFindQuery } from '../queries.js';
import { normalizeImovel } from '../validation.js';

export function imoveisRouter(db) {
  const router = Router();
  const { clientes, imoveis, visitas } = collections(db);

  router.get('/', asyncRoute(async (req, res) => {
    const data = await imoveis.find(buildImoveisFindQuery(req.query)).sort({ preco: 1 }).toArray();
    res.json(data);
  }));

  router.get('/:id', asyncRoute(async (req, res) => {
    const imovel = await imoveis.findOne({ _id: toObjectId(req.params.id) });
    if (!imovel) return res.status(404).json({ error: 'Imovel nao encontrado' });
    res.json(imovel);
  }));

  router.post('/', asyncRoute(async (req, res) => {
    const imovel = normalizeImovel(req.body);
    imovel.dono_id = toObjectId(imovel.dono_id, 'dono_id');
    await assertVendedorExists(clientes, imovel.dono_id);

    const result = await imoveis.insertOne(imovel);
    res.status(201).json({ ...imovel, _id: result.insertedId });
  }));

  router.put('/:id', asyncRoute(async (req, res) => {
    const id = toObjectId(req.params.id);
    const imovel = normalizeImovel(req.body, true);
    if (imovel.dono_id) {
      imovel.dono_id = toObjectId(imovel.dono_id, 'dono_id');
      await assertVendedorExists(clientes, imovel.dono_id);
    }

    const result = await imoveis.findOneAndUpdate(
      { _id: id },
      { $set: imovel },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Imovel nao encontrado' });
    res.json(result);
  }));

  router.delete('/:id', asyncRoute(async (req, res) => {
    const id = toObjectId(req.params.id);
    const totalVisitas = await visitas.countDocuments({ imovel_id: id });
    if (totalVisitas > 0) {
      return res.status(409).json({ error: 'Imovel possui visitas vinculadas e nao pode ser excluido' });
    }

    const result = await imoveis.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Imovel nao encontrado' });
    res.status(204).send();
  }));

  return router;
}

async function assertVendedorExists(clientes, id) {
  const vendedor = await clientes.findOne({ _id: id, tipo: 'vendedor' });
  if (!vendedor) {
    const error = new Error('dono_id deve referenciar um cliente vendedor');
    error.status = 400;
    throw error;
  }
}
