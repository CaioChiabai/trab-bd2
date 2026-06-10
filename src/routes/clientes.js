import { Router } from 'express';
import { asyncRoute } from '../async-route.js';
import { collections, toId, getNextSequenceValue } from '../db.js';
import { normalizeCliente, normalizeInteresse } from '../validation.js';

export function clientesRouter(db) {
  const router = Router();
  const { clientes, imoveis, visitas } = collections(db);

  router.get('/', asyncRoute(async (req, res) => {
    const query = {};
    if (req.query.tipo) query.tipo = req.query.tipo;
    if (req.query.comInteresses === 'true') query.interesses = { $exists: true, $ne: [] };

    const data = await clientes.find(query).sort({ nome: 1 }).toArray();
    res.json(data);
  }));

  router.get('/:id', asyncRoute(async (req, res) => {
    const cliente = await clientes.findOne({ _id: toId(req.params.id) });
    if (!cliente) return res.status(404).json({ error: 'Cliente nao encontrado' });
    res.json(cliente);
  }));

  router.post('/', asyncRoute(async (req, res) => {
    const cliente = normalizeCliente(req.body);
    cliente._id = await getNextSequenceValue(db, 'cliente_id');
    await clientes.insertOne(cliente);
    res.status(201).json(cliente);
  }));

  router.put('/:id', asyncRoute(async (req, res) => {
    const id = toId(req.params.id);
    const cliente = normalizeCliente(req.body, true);
    const result = await clientes.findOneAndUpdate(
      { _id: id },
      { $set: cliente },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Cliente nao encontrado' });
    res.json(result);
  }));

  router.delete('/:id', asyncRoute(async (req, res) => {
    const id = toId(req.params.id);
    const [imoveisDoCliente, visitasDoCliente] = await Promise.all([
      imoveis.countDocuments({ dono_id: id }),
      visitas.countDocuments({ cliente_id: id })
    ]);

    if (imoveisDoCliente > 0 || visitasDoCliente > 0) {
      return res.status(409).json({
        error: 'Cliente possui imoveis ou visitas vinculadas e nao pode ser excluido'
      });
    }

    const result = await clientes.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Cliente nao encontrado' });
    res.status(204).send();
  }));

  router.post('/:id/interesses', asyncRoute(async (req, res) => {
    const id = toId(req.params.id);
    const interesse = normalizeInteresse(req.body);
    const result = await clientes.findOneAndUpdate(
      { _id: id, tipo: 'comprador' },
      { $push: { interesses: interesse } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Cliente comprador nao encontrado' });
    res.status(201).json(result);
  }));

  router.put('/:id/interesses/:index', asyncRoute(async (req, res) => {
    const id = toId(req.params.id);
    const index = Number(req.params.index);
    const interesse = normalizeInteresse(req.body);
    const result = await clientes.findOneAndUpdate(
      { _id: id, [`interesses.${index}`]: { $exists: true } },
      { $set: { [`interesses.${index}`]: interesse } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Interesse nao encontrado' });
    res.json(result);
  }));

  router.delete('/:id/interesses/:index', asyncRoute(async (req, res) => {
    const id = toId(req.params.id);
    const index = Number(req.params.index);
    const cliente = await clientes.findOne({ _id: id });
    if (!cliente || !cliente.interesses?.[index]) {
      return res.status(404).json({ error: 'Interesse nao encontrado' });
    }

    cliente.interesses.splice(index, 1);
    await clientes.updateOne({ _id: id }, { $set: { interesses: cliente.interesses } });
    res.json(cliente);
  }));

  return router;
}
