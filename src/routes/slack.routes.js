import { Router } from 'express';
import { fetchRecentMessages, listChannels } from '../slack/slack.js';
import { upsertMessage } from '../collections/messages.js';
import { getRules } from '../collections/rules.js';
import { prioritize } from '../services/prioritize.js';
import { requireAuth } from '../auth/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/channels', async (req, res) => {
  try {
    res.json(await listChannels());
  } catch (err) {
    res.status(502).json({ error: 'Could not reach Slack: ' + err.message });
  }
});

// Pull recent Slack messages, prioritize them, and store them.
router.post('/sync', async (req, res) => {
  try {
    const [messages, rules] = await Promise.all([
      fetchRecentMessages(),
      getRules(req.userId),
    ]);
    for (const msg of messages) {
      msg.priority = prioritize(msg, rules);
      await upsertMessage(req.userId, msg);
    }
    res.json({ synced: messages.length });
  } catch (err) {
    res.status(502).json({ error: 'Sync failed: ' + err.message });
  }
});

export default router;
