import { Router } from 'express';
import { createUser, findUserByEmail } from '../collections/users.js';
import {
  hashPassword,
  verifyPassword,
  createToken,
  requireAuth,
} from '../auth/auth.js';

const router = Router();

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (await findUserByEmail(email)) {
    return res
      .status(409)
      .json({ error: 'An account with that email exists.' });
  }
  const user = await createUser({
    email,
    passwordHash: hashPassword(password),
  });
  res.json({ token: createToken(user._id.toString()), email: user.email });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  res.json({ token: createToken(user._id.toString()), email: user.email });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ userId: req.userId });
});

export default router;
