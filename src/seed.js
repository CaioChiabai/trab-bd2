import { connectDB } from './db.js';

const db = await connectDB();

console.log('Limpando banco...');

await db.collection('visitas').deleteMany({});
await db.collection('imoveis').deleteMany({});
await db.collection('clientes').deleteMany({});

const clientes = [
  {
    nome: 'João Silva',
    endereco: {
      tipo_logradouro: 'Rua',
      logradouro: 'das Flores',
      numero: '123',
      bairro: 'Centro',
      cep: '29100-001',
      cidade: 'Serra',
      uf: 'ES'
    },
    telefone: '27999990001',
    email: 'joao@imobiliaria.com',
    tipo: ['vendedor'],
    interesses: []
  },
  {
    nome: 'Maria Souza',
    endereco: {
      tipo_logradouro: 'Avenida',
      logradouro: 'Brasil',
      numero: '50',
      bairro: 'Jardim Camburi',
      cep: '29090-100',
      cidade: 'Vitória',
      uf: 'ES'
    },
    telefone: '27999990002',
    email: 'maria@imobiliaria.com',
    tipo: ['comprador'],
    interesses: [{
      quartos: 3,
      tamanho_min_m2: 90,
      area_lazer: true,
      bairro: 'Jardim Camburi',
      cidade: 'Vitória',
      uf: 'ES',
      valor_maximo: 600000
    }]
  }
];

// cria mais clientes automaticamente
for (let i = 3; i <= 20; i++) {
  clientes.push({
    nome: `Cliente ${i}`,
    endereco: {
      tipo_logradouro: 'Rua',
      logradouro: `Rua ${i}`,
      numero: String(i * 10),
      bairro: ['Centro', 'Jardim', 'Praia', 'Industrial'][i % 4],
      cep: `29100-${100 + i}`,
      cidade: ['Serra', 'Vitória', 'Vila Velha', 'Cariacica'][i % 4],
      uf: 'ES'
    },
    telefone: `2799999${String(i).padStart(4, '0')}`,
    email: `cliente${i}@email.com`,
    tipo:
      i <= 10
        ? ['vendedor']
        : ['comprador'],
    interesses:
      i <= 10
        ? []
        : [{
            quartos: (i % 4) + 1,
            tamanho_min_m2: 60 + i * 5,
            area_lazer: i % 2 === 0,
            bairro: ['Centro', 'Jardim', 'Praia'][i % 3],
            cidade: ['Serra', 'Vitória', 'Vila Velha'][i % 3],
            uf: 'ES',
            valor_maximo: 300000 + i * 50000
          }]
  });
}

const clientesResult = await db.collection('clientes').insertMany(clientes);

const clientesInseridos = Object.values(clientesResult.insertedIds);

const vendedores = clientesInseridos.slice(0, 10);
const compradores = clientesInseridos.slice(10);

console.log('Clientes inseridos:', clientesInseridos.length);

const tiposImovel = [
  'casa',
  'apartamento',
  'cobertura',
  'terreno'
];

const imoveis = [];

for (let i = 0; i < 20; i++) {
  imoveis.push({
    tipo: tiposImovel[i % tiposImovel.length],
    endereco: {
      tipo_logradouro: 'Rua',
      logradouro: `Imovel ${i + 1}`,
      numero: String(100 + i),
      bairro: ['Centro', 'Praia', 'Jardim', 'Industrial'][i % 4],
      cep: `29110-${100 + i}`,
      cidade: ['Serra', 'Vitória', 'Vila Velha', 'Cariacica'][i % 4],
      uf: 'ES'
    },
    preco: 200000 + i * 50000,
    data_construcao: new Date(2000 + (i % 20), 0, 1),
    ocupado: i % 3 === 0,
    dono_id: vendedores[i % vendedores.length]
  });
}

const imoveisResult = await db.collection('imoveis').insertMany(imoveis);

const imoveisInseridos = Object.values(imoveisResult.insertedIds);

console.log('Imóveis inseridos:', imoveisInseridos.length);

const visitas = [];

for (let i = 0; i < 30; i++) {
  visitas.push({
    cliente_id: compradores[i % compradores.length],
    imovel_id: imoveisInseridos[i % imoveisInseridos.length],
    data_hora: new Date(
      2025,
      i % 12,
      (i % 28) + 1,
      10 + (i % 8),
      0
    ),
    observacao: `Visita ${i + 1}`
  });
}

await db.collection('visitas').insertMany(visitas);

console.log('Visitas inseridas:', visitas.length);

console.log('Seed executada com sucesso!');
process.exit(0);