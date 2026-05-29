import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

    const apiKey = process.env['GROQ_API_KEY'] ?? '';
    const { data } = await axios.post(
      GROQ_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0,
      },
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );

    const text = (data as { choices: { message: { content: string } }[] })
      .choices[0].message.content;
    const parsed = JSON.parse(text);
    res.status(200).json(parsed);
  } catch (err) {
    const e = err as { response?: { status?: number; data?: unknown } };
    console.error('[autofill-food] status:', e.response?.status);
    console.error('[autofill-food] data:', JSON.stringify(e.response?.data, null, 2));
    const status = e.response?.status;
    if (status === 429) {
      res.status(429).json({ error: 'Too many requests — please wait a moment and try again.' });
    } else {
      res.status(422).json({ error: 'Could not estimate nutrition. Try again or enter values manually.' });
    }
  }
}
