import { ObjectId } from 'mongodb';
import { getDB } from '../db/connection.js';

const collection = () => getDB().collection('users');

export async function createUser({ email, passwordHash }) {
  const doc = { email, passwordHash, createdAt: new Date() };
  const { insertedId } = await collection().insertOne(doc);
  return { _id: insertedId, ...doc };
}

export async function findUserByEmail(email) {
  return collection().findOne({ email });
}

export async function findUserById(id) {
  return collection().findOne({ _id: new ObjectId(id) });
}
