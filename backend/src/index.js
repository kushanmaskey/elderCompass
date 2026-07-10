import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import homesRouter from './routes/homes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/homes', homesRouter);

app.listen(PORT, () => {
  console.log(`ElderCompass API running on http://localhost:${PORT}`);
});
