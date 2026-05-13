import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'empresa_imoveis';

let client;
let database;

export async function connectDatabase() {
  if (database) {
    return database;
  }

  client = new MongoClient(uri);
  await client.connect();
  database = client.db(dbName);
  await createIndexes(database);
  return database;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
  }
}

export function collections(db) {
  return {
    clientes: db.collection('clientes'),
    imoveis: db.collection('imoveis'),
    visitas: db.collection('visitas')
  };
}

export function toObjectId(value, fieldName = 'id') {
  if (!ObjectId.isValid(value)) {
    const error = new Error(`${fieldName} invalido`);
    error.status = 400;
    throw error;
  }
  return new ObjectId(value);
}

async function createIndexes(db) {
  const { clientes, imoveis, visitas } = collections(db);

  await Promise.all([
    clientes.createIndex({ email: 1 }, { unique: true }),
    clientes.createIndex({ tipo: 1 }),
    imoveis.createIndex({ dono_id: 1 }),
    imoveis.createIndex({ tipo: 1, preco: 1, ocupado: 1 }),
    imoveis.createIndex({ 'endereco.bairro': 1, 'endereco.cidade': 1, 'endereco.uf': 1 }),
    visitas.createIndex({ imovel_id: 1 }),
    visitas.createIndex({ cliente_id: 1 }),
    visitas.createIndex({ data_hora: -1 })
  ]);
}
