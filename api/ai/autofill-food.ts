import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  try {
    const name: string = ((req.body as { name?: string }).name ?? '').trim();
    if (!name) {
      res.status(400).json({ error: 'name is required' });
      return;
    }

    const prompt = `You are a nutrition database assistant. Given a food name, return ONLY a JSON object with these exact keys: servingSize (number), unitOfMeasurement (string — "g", "ml", or "piece"), calories (number, kcal), protein (number, g), fiber (number, g).
Use a standard single-serve amount: 100 g for most solid foods, 240 ml for liquids, 1 piece for unit foods (egg, banana, etc.).
Food: "${name}"
Respond with ONLY the JSON object. No markdown fences, no explanation.`;

    const apiKey = process.env['GEMINI_API_KEY'] ?? '';
    const { data } = await axios.post(
      `${GEMINI_URL}?key=${apiKey}`,
      { contents: [{ parts: [{ text: prompt }] }] },
    );

    const text   = (data as { candidates: { content: { parts: { text: string }[] } }[] })
      .candidates[0].content.parts[0].text.trim();
    const parsed = JSON.parse(text);
    res.status(200).json(parsed);
  } catch {
    res.status(422).json({ error: 'Could not estimate nutrition. Try again or enter values manually.' });
  }
}
