import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectDB, getDB } from './src/db/connection.js';
import authRoutes from './src/routes/auth.routes.js';
import messageRoutes from './src/routes/messages.routes.js';
import ruleRoutes from './src/routes/rules.routes.js';
import slackRoutes from './src/routes/slack.routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/slack', slackRoutes);

const PORT = process.env.PORT || 3000;

async function createIndexes() {
  const db = getDB();
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db
    .collection('messages')
    .createIndex({ userId: 1, channelId: 1, ts: 1 }, { unique: true });
  await db.collection('rules').createIndex({ userId: 1 });
}

async function start() {
  await connectDB();
  await createIndexes();
  app.listen(PORT, () => console.log(`PriorityFeed running on port ${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
