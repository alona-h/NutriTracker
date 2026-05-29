import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import express from 'express';
import autofillFood from './ai/autofill-food.js';
import insights from './ai/insights.js';

const app = express();
app.use(express.json());

app.post('/api/ai/autofill-food', (req, res) => autofillFood(req as never, res as never));
app.post('/api/ai/insights',      (req, res) => insights(req as never, res as never));

const PORT = 3001;
app.listen(PORT, () => console.log(`Local API server running at http://localhost:${PORT}`));
