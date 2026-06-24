import { getRules } from '../collections/rules.js';
import { getAllForUser, setPriority } from '../collections/messages.js';
import { prioritize } from './prioritize.js';

// Recompute the stored priority of every message for a user.
// Called after rules change or new messages are synced.
export async function reprioritizeUser(userId) {
  const rules = await getRules(userId);
  const messages = await getAllForUser(userId);
  for (const msg of messages) {
    const next = prioritize(msg, rules);
    if (next !== msg.priority) await setPriority(userId, msg._id, next);
  }
}
