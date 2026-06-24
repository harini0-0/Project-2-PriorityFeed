import { MongoClient } from 'mongodb';

let client;
let db;

// Opens a single shared connection and caches the database handle.
export async function connectDB() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set. See .env.example.');

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(process.env.MONGODB_DB || 'priorityfeed');
  console.log('Connected to MongoDB.');
  return db;
}

// Convenience accessor used by the collection modules.
export function getDB() {
  if (!db) throw new Error('Database not connected. Call connectDB() first.');
  return db;
}
