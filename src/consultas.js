import { closeDatabase, collections, connectDB } from './db.js';
import { pipelines } from './queries.js';

const db = await connectDB();
const { clientes, imoveis, visitas } = collections(db);

const consultas = [
  ['find: imoveis disponiveis', () => imoveis.find({ ocupado: false }).sort({ preco: 1 }).toArray()],
  [
    'find: apartamentos em Belo Horizonte ate 550000',
    () => imoveis.find({ tipo: 'apartamento', 'endereco.cidade': 'Belo Horizonte', preco: { $lte: 550000 } }).toArray()
  ],
  [
    'find: compradores com interesses',
    () => clientes.find({ tipo: 'comprador', interesses: { $exists: true, $ne: [] } }).sort({ nome: 1 }).toArray()
  ],
  ['aggregate: imoveis por tipo', () => imoveis.aggregate(pipelines.imoveisPorTipo).toArray()],
  ['aggregate: preco medio por localidade', () => imoveis.aggregate(pipelines.precoMedioPorLocalidade).toArray()],
  ['aggregate: imoveis com vendedor', () => imoveis.aggregate(pipelines.imoveisComVendedor).toArray()],
  ['aggregate: visitas com cliente e imovel', () => visitas.aggregate(pipelines.visitasComClienteEImovel).toArray()],
  ['funcoes agregadas: menor, maior e medio preco', () => imoveis.aggregate(pipelines.precoMinMax).toArray()],
  ['funcoes agregadas: total de visitas por imovel', () => visitas.aggregate(pipelines.visitasPorImovel).toArray()],
  ['funcoes agregadas: quantidade de imoveis por vendedor', () => imoveis.aggregate(pipelines.imoveisPorVendedor).toArray()]
];

for (const [titulo, executar] of consultas) {
  console.log(`\n## ${titulo}`);
  console.log(JSON.stringify(await executar(), null, 2));
}

await closeDatabase();
