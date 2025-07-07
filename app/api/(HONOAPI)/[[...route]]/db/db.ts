import { MongoClient, Db } from 'mongodb';

const url = process.env.MONGODB_URL;
if (!url) {
  throw new Error('MongoDB URL is not defined in environment variables');
}

const dbName = 'agendamento';

let client: MongoClient | null = null;
let db: Db | null = null;

async function connectToDB(): Promise<Db> {
  if (db) {
    return db;
  }

  client = new MongoClient(url!);
  await client.connect();
  db = client.db(dbName);
  console.log('✅ Connected to MongoDB');
  return db;
}

export async function getUserCollection() {
    const database = await connectToDB();
    return database.collection('users');
}

export async function getClientCollection() {
    const database = await connectToDB();
    return database.collection('clients');
}
  
  
export async function getAgendaCollection() {
    const database = await connectToDB();
    return database.collection('agenda');
}