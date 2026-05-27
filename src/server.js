import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import { clientesRouter } from './routes/clientes.js';
import { imoveisRouter } from './routes/imoveis.js';
import { visitasRouter } from './routes/visitas.js';
import { consultasRouter } from './routes/consultas.js';

const port = Number(process.env.PORT || 3000);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = await connectDB();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: db.databaseName });
});

app.use('/api/clientes', clientesRouter(db));
app.use('/api/imoveis', imoveisRouter(db));
app.use('/api/visitas', visitasRouter(db));
app.use('/api/consultas', consultasRouter(db));

app.use((err, _req, res, _next) => {
  if (err.code === 11000) {
    const duplicatedField = Object.keys(err.keyValue || {})[0];
    const duplicatedValue = err.keyValue?.[duplicatedField];
    const message = duplicatedField
      ? `Ja existe um registro com ${duplicatedField}: ${duplicatedValue}`
      : 'Registro duplicado';

    return res.status(409).json({ error: message, details: err.keyValue });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Erro interno' });
});

app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});
