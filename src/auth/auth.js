import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || 'dev-secret';

// --- Password hashing (scrypt, salt stored alongside hash) ---
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(test));
}

// --- Stateless signed tokens (no session store needed) ---
function sign(data) {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
}

export function createToken(userId) {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token) {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || signature !== sign(payload)) return null;
  try {
    const { uid, exp } = JSON.parse(
      Buffer.from(payload, 'base64url').toString()
    );
    if (Date.now() > exp) return null;
    return uid;
  } catch {
    return null;
  }
}

// Express middleware: requires a valid Bearer token, sets req.userId.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const userId = verifyToken(header.replace('Bearer ', ''));
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  req.userId = userId;
  next();
}
