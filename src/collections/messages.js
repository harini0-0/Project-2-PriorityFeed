import { ObjectId } from 'mongodb';
import { getDB } from '../db/connection.js';

const collection = () => getDB().collection('messages');

// Insert a message if it isn't already stored (deduped by channel + ts per user).
export async function upsertMessage(userId, msg) {
  const filter = {
    userId: new ObjectId(userId),
    channelId: msg.channelId,
    ts: msg.ts,
  };
  await collection().updateOne(
    filter,
    {
      $set: {
        channelName: msg.channelName,
        senderId: msg.senderId,
        senderName: msg.senderName,
        text: msg.text,
        tsDate: msg.tsDate,
        priority: msg.priority,
      },
      $setOnInsert: {
        ...filter,
        bookmarked: false,
        read: false,
        fetchedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

// Read with optional filters: { priority, channelName, senderName, bookmarked }.
export async function getMessages(userId, filters = {}) {
  const query = { userId: new ObjectId(userId) };
  if (filters.priority) query.priority = filters.priority;
  if (filters.channelName) query.channelName = filters.channelName;
  if (filters.senderName) query.senderName = filters.senderName;
  if (filters.bookmarked === 'true') query.bookmarked = true;

  return collection().find(query).sort({ tsDate: -1 }).limit(300).toArray();
}

export async function updateMessage(userId, messageId, changes) {
  const allowed = {};
  if ('bookmarked' in changes) allowed.bookmarked = !!changes.bookmarked;
  if ('read' in changes) allowed.read = !!changes.read;

  const { matchedCount } = await collection().updateOne(
    { _id: new ObjectId(messageId), userId: new ObjectId(userId) },
    { $set: allowed }
  );
  return matchedCount === 1;
}

export async function deleteMessage(userId, messageId) {
  const { deletedCount } = await collection().deleteOne({
    _id: new ObjectId(messageId),
    userId: new ObjectId(userId),
  });
  return deletedCount === 1;
}

// Recompute stored priorities after rules change.
export async function setPriority(userId, messageId, priority) {
  await collection().updateOne(
    { _id: messageId, userId: new ObjectId(userId) },
    { $set: { priority } }
  );
}

export async function getAllForUser(userId) {
  return collection()
    .find({ userId: new ObjectId(userId) })
    .toArray();
}

// Distinct senders and channels seen so far, used to populate rule dropdowns.
export async function getFacets(userId) {
  const uid = new ObjectId(userId);
  const senders = await collection()
    .aggregate([
      { $match: { userId: uid } },
      { $group: { _id: { name: '$senderName', id: '$senderId' } } },
      { $sort: { '_id.name': 1 } },
    ])
    .toArray();
  const channels = await collection().distinct('channelName', { userId: uid });
  return {
    senders: senders.map((s) => s._id).filter((s) => s.name),
    channels: channels.sort(),
  };
}

// Count of unread messages grouped by priority.
export async function unreadSummary(userId) {
  const rows = await collection()
    .aggregate([
      { $match: { userId: new ObjectId(userId), read: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ])
    .toArray();
  const summary = { Critical: 0, Important: 0, Normal: 0 };
  for (const r of rows) if (r._id in summary) summary[r._id] = r.count;
  return summary;
}
