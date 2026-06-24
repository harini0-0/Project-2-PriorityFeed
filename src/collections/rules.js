import { ObjectId } from 'mongodb';
import { getDB } from '../db/connection.js';

const collection = () => getDB().collection('rules');

// type: 'channel' | 'sender' | 'keyword'
// priority: 'Critical' | 'Important' | 'Normal'
export async function createRule({ userId, type, value, priority }) {
  const doc = {
    userId: new ObjectId(userId),
    type,
    value,
    priority,
    createdAt: new Date(),
  };
  const { insertedId } = await collection().insertOne(doc);
  return { _id: insertedId, ...doc };
}

export async function getRules(userId) {
  return collection()
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function deleteRule(userId, ruleId) {
  const { deletedCount } = await collection().deleteOne({
    _id: new ObjectId(ruleId),
    userId: new ObjectId(userId),
  });
  return deletedCount === 1;
}
