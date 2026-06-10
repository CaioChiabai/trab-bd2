import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'empresa_imoveis';

let client;
let database;

export async function connectDB() {
  if (database) {
    return database;
  }

  try {
    console.log(`Conectando ao MongoDB...`);
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    await client.connect();
    database = client.db(dbName);
    console.log(`Conectado com sucesso ao banco de dados: ${dbName}`);
    
    await createIndexes(database);
    return database;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
}

export function getDB() {
  if (!database) {
    throw new Error('Banco de dados não conectado. Chame connectDB() primeiro.');
  }
  return database;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
    console.log('Conexão com o MongoDB encerrada.');
  }
}

export function collections(db) {
  return {
    clientes: db.collection('clientes'),
    imoveis: db.collection('imoveis'),
    visitas: db.collection('visitas')
  };
}

export async function getNextSequenceValue(db, sequenceName) {
  const sequenceDocument = await db.collection('counters').findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return sequenceDocument.sequence_value;
}

export function toId(value, fieldName = 'id') {
  const id = Number(value);
  if (isNaN(id) || id <= 0) {
    const error = new Error(`${fieldName} inválido`);
    error.status = 400;
    throw error;
  }
  return id;
}

async function createIndexes(db) {
  const { clientes, imoveis, visitas } = collections(db);

  await Promise.all([
    clientes.createIndex({ email: 1 }, { unique: true }),
    clientes.createIndex({ telefone: 1 }),
    imoveis.createIndex({ 'endereco.cidade': 1 }),
    imoveis.createIndex({ 'endereco.bairro': 1 }),
    imoveis.createIndex({ preco: 1 }),
    imoveis.createIndex({ tipo: 1 }),
    visitas.createIndex({ cliente_id: 1 }),
    visitas.createIndex({ imovel_id: 1 }),
    visitas.createIndex({ data_hora: 1 })
  ]).catch(err => console.error('Erro ao criar índices:', err));
  
  console.log('Índices criados/verificados com sucesso.');
}
