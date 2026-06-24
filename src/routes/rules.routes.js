import { Router } from 'express';
import { createRule, getRules, deleteRule } from '../collections/rules.js';
import { requireAuth } from '../auth/auth.js';
import { reprioritizeUser } from '../services/reprioritize.js';

const router = Router();
router.use(requireAuth);

const TYPES = ['channel', 'sender', 'keyword'];
const PRIORITIES = ['Critical', 'Important', 'Normal'];

router.get('/', async (req, res) => {
  res.json(await getRules(req.userId));
});

router.post('/', async (req, res) => {
  const { type, value, priority } = req.body;
  if (!TYPES.includes(type) || !PRIORITIES.includes(priority) || !value) {
    return res.status(400).json({ error: 'Invalid rule.' });
  }
  const rule = await createRule({ userId: req.userId, type, value, priority });
  await reprioritizeUser(req.userId);
  res.json(rule);
});

router.delete('/:id', async (req, res) => {
  const ok = await deleteRule(req.userId, req.params.id);
  if (!ok) return res.status(404).json({ error: 'Rule not found.' });
  await reprioritizeUser(req.userId);
  res.json({ ok: true });
});

export default router;
