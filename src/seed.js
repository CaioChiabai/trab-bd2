import { ObjectId } from 'mongodb';
import { closeDatabase, collections, connectDatabase } from './db.js';

const db = await connectDatabase();
const { clientes, imoveis, visitas } = collections(db);

await Promise.all([
  clientes.deleteMany({}),
  imoveis.deleteMany({}),
  visitas.deleteMany({})
]);

const ids = {
  ana: new ObjectId(),
  bruno: new ObjectId(),
  carla: new ObjectId(),
  diego: new ObjectId(),
  elisa: new ObjectId(),
  fernanda: new ObjectId(),
  gustavo: new ObjectId(),
  helena: new ObjectId(),
  igor: new ObjectId(),
  juliana: new ObjectId()
};

await clientes.insertMany([
  {
    _id: ids.ana,
    nome: 'Ana Martins',
    endereco: 'Rua das Flores, 120, Belo Horizonte/MG',
    telefone: '31999990001',
    email: 'ana.martins@email.com',
    tipo: ['vendedor'],
    interesses: []
  },
  {
    _id: ids.bruno,
    nome: 'Bruno Almeida',
    endereco: 'Av. Brasil, 455, Sao Paulo/SP',
    telefone: '11999990002',
    email: 'bruno.almeida@email.com',
    tipo: ['vendedor'],
    interesses: []
  },
  {
    _id: ids.carla,
    nome: 'Carla Souza',
    endereco: 'Rua XV, 88, Curitiba/PR',
    telefone: '41999990003',
    email: 'carla.souza@email.com',
    tipo: ['vendedor'],
    interesses: []
  },
  {
    _id: ids.diego,
    nome: 'Diego Ribeiro',
    endereco: 'Rua Amazonas, 90, Contagem/MG',
    telefone: '31999990004',
    email: 'diego.ribeiro@email.com',
    tipo: ['vendedor', 'comprador'],
    interesses: [
      {
        quartos: 3,
        tamanho_min_m2: 90,
        area_lazer: true,
        bairro: 'Buritis',
        cidade: 'Belo Horizonte',
        uf: 'MG',
        valor_maximo: 650000
      }
    ]
  },
  {
    _id: ids.elisa,
    nome: 'Elisa Pereira',
    endereco: 'Rua Paraiba, 501, Belo Horizonte/MG',
    telefone: '31999990005',
    email: 'elisa.pereira@email.com',
    tipo: ['vendedor'],
    interesses: []
  },
  {
    _id: ids.fernanda,
    nome: 'Fernanda Costa',
    endereco: 'Av. Paulista, 1000, Sao Paulo/SP',
    telefone: '11999990006',
    email: 'fernanda.costa@email.com',
    tipo: ['comprador'],
    interesses: [
      {
        quartos: 2,
        tamanho_min_m2: 60,
        area_lazer: true,
        bairro: 'Centro',
        cidade: 'Sao Paulo',
        uf: 'SP',
        valor_maximo: 480000
      }
    ]
  },
  {
    _id: ids.gustavo,
    nome: 'Gustavo Lima',
    endereco: 'Rua Bahia, 333, Belo Horizonte/MG',
    telefone: '31999990007',
    email: 'gustavo.lima@email.com',
    tipo: ['comprador'],
    interesses: [
      {
        quartos: 1,
        tamanho_min_m2: 35,
        area_lazer: false,
        bairro: 'Savassi',
        cidade: 'Belo Horizonte',
        uf: 'MG',
        valor_maximo: 350000
      },
      {
        quartos: 2,
        tamanho_min_m2: 70,
        area_lazer: true,
        bairro: 'Funcionarios',
        cidade: 'Belo Horizonte',
        uf: 'MG',
        valor_maximo: 520000
      }
    ]
  },
  {
    _id: ids.helena,
    nome: 'Helena Rocha',
    endereco: 'Rua das Palmeiras, 210, Curitiba/PR',
    telefone: '41999990008',
    email: 'helena.rocha@email.com',
    tipo: ['comprador'],
    interesses: [
      {
        quartos: 4,
        tamanho_min_m2: 140,
        area_lazer: true,
        bairro: 'Batel',
        cidade: 'Curitiba',
        uf: 'PR',
        valor_maximo: 1200000
      }
    ]
  },
  {
    _id: ids.igor,
    nome: 'Igor Barros',
    endereco: 'Rua Ceara, 44, Belo Horizonte/MG',
    telefone: '31999990009',
    email: 'igor.barros@email.com',
    tipo: ['comprador'],
    interesses: [
      {
        quartos: 0,
        tamanho_min_m2: 20,
        area_lazer: false,
        bairro: 'Centro',
        cidade: 'Belo Horizonte',
        uf: 'MG',
        valor_maximo: 180000
      }
    ]
  },
  {
    _id: ids.juliana,
    nome: 'Juliana Nunes',
    endereco: 'Rua Goias, 700, Uberlandia/MG',
    telefone: '34999990010',
    email: 'juliana.nunes@email.com',
    tipo: ['comprador'],
    interesses: [
      {
        quartos: 3,
        tamanho_min_m2: 100,
        area_lazer: true,
        bairro: 'Jardim Karaiba',
        cidade: 'Uberlandia',
        uf: 'MG',
        valor_maximo: 750000
      }
    ]
  }
]);

const imovelIds = Array.from({ length: 10 }, () => new ObjectId());

await imoveis.insertMany([
  {
    _id: imovelIds[0],
    tipo: 'apartamento',
    endereco: { logradouro: 'Rua Aimores', numero: '1500', bairro: 'Funcionarios', cidade: 'Belo Horizonte', uf: 'MG' },
    preco: 500000,
    data_construcao: new Date('2016-03-10'),
    ocupado: false,
    dono_id: ids.ana
  },
  {
    _id: imovelIds[1],
    tipo: 'casa',
    endereco: { logradouro: 'Rua Rubi', numero: '77', bairro: 'Buritis', cidade: 'Belo Horizonte', uf: 'MG' },
    preco: 720000,
    data_construcao: new Date('2012-08-21'),
    ocupado: true,
    dono_id: ids.ana
  },
  {
    _id: imovelIds[2],
    tipo: 'loja',
    endereco: { logradouro: 'Av. Afonso Pena', numero: '910', bairro: 'Centro', cidade: 'Belo Horizonte', uf: 'MG' },
    preco: 430000,
    data_construcao: new Date('2008-11-05'),
    ocupado: false,
    dono_id: ids.bruno
  },
  {
    _id: imovelIds[3],
    tipo: 'apartamento',
    endereco: { logradouro: 'Rua Augusta', numero: '1220', bairro: 'Centro', cidade: 'Sao Paulo', uf: 'SP' },
    preco: 465000,
    data_construcao: new Date('2019-01-15'),
    ocupado: false,
    dono_id: ids.bruno
  },
  {
    _id: imovelIds[4],
    tipo: 'garagem',
    endereco: { logradouro: 'Rua Parana', numero: '44', bairro: 'Centro', cidade: 'Curitiba', uf: 'PR' },
    preco: 85000,
    data_construcao: new Date('2020-06-12'),
    ocupado: false,
    dono_id: ids.carla
  },
  {
    _id: imovelIds[5],
    tipo: 'casa',
    endereco: { logradouro: 'Rua Bispo Dom Jose', numero: '500', bairro: 'Batel', cidade: 'Curitiba', uf: 'PR' },
    preco: 1180000,
    data_construcao: new Date('2010-04-18'),
    ocupado: true,
    dono_id: ids.carla
  },
  {
    _id: imovelIds[6],
    tipo: 'apartamento',
    endereco: { logradouro: 'Rua Pernambuco', numero: '101', bairro: 'Savassi', cidade: 'Belo Horizonte', uf: 'MG' },
    preco: 340000,
    data_construcao: new Date('2018-09-30'),
    ocupado: false,
    dono_id: ids.diego
  },
  {
    _id: imovelIds[7],
    tipo: 'casa',
    endereco: { logradouro: 'Av. Nicomedes Alves', numero: '3000', bairro: 'Jardim Karaiba', cidade: 'Uberlandia', uf: 'MG' },
    preco: 730000,
    data_construcao: new Date('2014-07-07'),
    ocupado: false,
    dono_id: ids.elisa
  },
  {
    _id: imovelIds[8],
    tipo: 'apartamento',
    endereco: { logradouro: 'Rua Bela Cintra', numero: '200', bairro: 'Consolacao', cidade: 'Sao Paulo', uf: 'SP' },
    preco: 610000,
    data_construcao: new Date('2021-02-20'),
    ocupado: false,
    dono_id: ids.elisa
  },
  {
    _id: imovelIds[9],
    tipo: 'loja',
    endereco: { logradouro: 'Av. Joao Pinheiro', numero: '222', bairro: 'Centro', cidade: 'Belo Horizonte', uf: 'MG' },
    preco: 390000,
    data_construcao: new Date('2005-05-05'),
    ocupado: true,
    dono_id: ids.diego
  }
]);

await visitas.insertMany([
  { imovel_id: imovelIds[0], cliente_id: ids.gustavo, data_hora: new Date('2026-04-01T10:00:00-03:00'), observacao: 'Gostou da localizacao.' },
  { imovel_id: imovelIds[0], cliente_id: ids.gustavo, data_hora: new Date('2026-04-05T15:30:00-03:00'), observacao: 'Segunda visita com familiares.' },
  { imovel_id: imovelIds[1], cliente_id: ids.diego, data_hora: new Date('2026-04-02T09:00:00-03:00'), observacao: 'Avaliou area de lazer.' },
  { imovel_id: imovelIds[2], cliente_id: ids.igor, data_hora: new Date('2026-04-03T11:20:00-03:00'), observacao: 'Interessado em ponto comercial.' },
  { imovel_id: imovelIds[3], cliente_id: ids.fernanda, data_hora: new Date('2026-04-04T14:00:00-03:00'), observacao: 'Dentro do valor maximo.' },
  { imovel_id: imovelIds[3], cliente_id: ids.fernanda, data_hora: new Date('2026-04-09T16:00:00-03:00'), observacao: 'Retornou para medir os ambientes.' },
  { imovel_id: imovelIds[4], cliente_id: ids.igor, data_hora: new Date('2026-04-06T10:15:00-03:00'), observacao: 'Visitou garagem central.' },
  { imovel_id: imovelIds[5], cliente_id: ids.helena, data_hora: new Date('2026-04-07T13:45:00-03:00'), observacao: 'Imovel compativel com interesse.' },
  { imovel_id: imovelIds[6], cliente_id: ids.gustavo, data_hora: new Date('2026-04-08T09:40:00-03:00'), observacao: 'Preferiu apartamento menor.' },
  { imovel_id: imovelIds[7], cliente_id: ids.juliana, data_hora: new Date('2026-04-10T11:00:00-03:00'), observacao: 'Boa aderencia ao bairro desejado.' },
  { imovel_id: imovelIds[8], cliente_id: ids.fernanda, data_hora: new Date('2026-04-11T17:10:00-03:00'), observacao: 'Acima do valor maximo informado.' },
  { imovel_id: imovelIds[9], cliente_id: ids.igor, data_hora: new Date('2026-04-12T08:30:00-03:00'), observacao: 'Comparou com outra loja no Centro.' }
]);

console.log('Banco populado com 10 clientes, 10 imoveis e 12 visitas.');
await closeDatabase();
