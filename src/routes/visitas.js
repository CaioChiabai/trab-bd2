import { Router } from 'express';
import { collections, toObjectId } from '../db.js';
import { normalizeVisita } from '../validation.js';

export function visitasRouter(db) {
  const router = Router();
  const { clientes, imoveis, visitas } = collections(db);

  router.get('/', async (_req, res) => {
    const data = await visitas.find().sort({ data_hora: -1 }).toArray();
    res.json(data);
  });

  router.get('/:id', async (req, res) => {
    const visita = await visitas.findOne({ _id: toObjectId(req.params.id) });
    if (!visita) return res.status(404).json({ error: 'Visita nao encontrada' });
    res.json(visita);
  });

  router.post('/', async (req, res) => {
    const visita = normalizeVisita(req.body);
    visita.imovel_id = toObjectId(visita.imovel_id, 'imovel_id');
    visita.cliente_id = toObjectId(visita.cliente_id, 'cliente_id');
    await assertReferences(clientes, imoveis, visita);

    const result = await visitas.insertOne(visita);
    res.status(201).json({ ...visita, _id: result.insertedId });
  });

  router.put('/:id', async (req, res) => {
    const id = toObjectId(req.params.id);
    const visita = normalizeVisita(req.body, true);
    if (visita.imovel_id) visita.imovel_id = toObjectId(visita.imovel_id, 'imovel_id');
    if (visita.cliente_id) visita.cliente_id = toObjectId(visita.cliente_id, 'cliente_id');
    await assertReferences(clientes, imoveis, visita);

    const result = await visitas.findOneAndUpdate(
      { _id: id },
      { $set: visita },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Visita nao encontrada' });
    res.json(result);
  });

  router.delete('/:id', async (req, res) => {
    const result = await visitas.deleteOne({ _id: toObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Visita nao encontrada' });
    res.status(204).send();
  });

  return router;
}

async function assertReferences(clientes, imoveis, visita) {
  if (visita.cliente_id) {
    const comprador = await clientes.findOne({ _id: visita.cliente_id, tipo: 'comprador' });
    if (!comprador) {
      const error = new Error('cliente_id deve referenciar um cliente comprador');
      error.status = 400;
      throw error;
    }
  }

  if (visita.imovel_id) {
    const imovel = await imoveis.findOne({ _id: visita.imovel_id });
    if (!imovel) {
      const error = new Error('imovel_id deve referenciar um imovel existente');
      error.status = 400;
      throw error;
    }
  }
}
