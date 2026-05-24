import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const name: string = ((req.body as { name?: string }).name ?? '').trim();
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }

  const prompt = `You are a nutrition database assistant. Given a food name, return ONLY a JSON object with these exact keys: servingSize (number), unitOfMeasurement (string — "g", "ml", or "piece"), calories (number, kcal), protein (number, g), fiber (number, g).
Use a standard single-serve amount: 100 g for most solid foods, 240 ml for liquids, 1 piece for unit foods (egg, banana, etc.).
Food: "${name}"
Respond with ONLY the JSON object. No markdown fences, no explanation.`;

  try {
    const genAI  = new GoogleGenerativeAI(process.env['GEMINI_API_KEY'] ?? '');
    const gemini = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await gemini.generateContent(prompt);
    const parsed = JSON.parse(result.response.text().trim()) as {
      servingSize: number;
      unitOfMeasurement: string;
      calories: number;
      protein: number;
      fiber: number;
    };
    res.status(200).json(parsed);
  } catch {
    res.status(422).json({ error: 'Could not estimate nutrition. Try again or enter values manually.' });
  }
}
