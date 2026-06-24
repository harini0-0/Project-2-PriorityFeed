import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectDB } from './src/db/connection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Routes are mounted here as each feature phase is built.

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`PriorityFeed running on port ${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
