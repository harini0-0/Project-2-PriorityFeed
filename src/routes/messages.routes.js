import { Router } from 'express';
import {
  getMessages,
  updateMessage,
  deleteMessage,
  unreadSummary,
} from '../collections/messages.js';
import { requireAuth } from '../auth/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { priority, channelName, senderName, bookmarked } = req.query;
  const messages = await getMessages(req.userId, {
    priority,
    channelName,
    senderName,
    bookmarked,
  });
  res.json(messages);
});

router.get('/summary', async (req, res) => {
  res.json(await unreadSummary(req.userId));
});

router.patch('/:id', async (req, res) => {
  const ok = await updateMessage(req.userId, req.params.id, req.body);
  if (!ok) return res.status(404).json({ error: 'Message not found.' });
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteMessage(req.userId, req.params.id);
  if (!ok) return res.status(404).json({ error: 'Message not found.' });
  res.json({ ok: true });
});

export default router;
