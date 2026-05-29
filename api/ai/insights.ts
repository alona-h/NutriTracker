import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface InsightsBody {
  profile:      { targetCalories: number; targetProtein: number; targetFiber: number };
  todayIntakes: { name: string; calories: number; protein: number; fiber: number }[];
  weekTotals:   { date: string; calories: number; protein: number; fiber: number }[];
  question?:    string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  try {
    const { profile, todayIntakes, weekTotals, question } = req.body as InsightsBody;

    const prompt = `You are an expert nutrition coach. Analyse the user's food log and return ONLY a JSON object with this exact shape:
{
  "headline": "string (1–2 sentence motivating insight, present tense)",
  "analyzedAgo": "string (e.g. '2 min ago' — just use '1 min ago')",
  "macroStatus": {
    "calories": { "pct": number (0-100), "label": "string (e.g. 'on track' | 'needs +Xkcal' | 'over target')", "gap": number | null },
    "protein":  { "pct": number (0-100), "label": "string", "gap": number | null },
    "fiber":    { "pct": number (0-100), "label": "string", "gap": number | null }
  },
  "suggestionContext": "string (e.g. '3 ideas to close your protein gap')",
  "suggestions": [
    { "name": "string", "calories": number, "protein": number, "fiber": number, "note": "string (short, max 12 words)" }
  ],
  "working": { "title": "string", "body": "string (1 sentence)", "days": [boolean, boolean, boolean, boolean, boolean, boolean, boolean] },
  "watch":   { "title": "string", "body": "string (1 sentence)" },
  "answer": string | null
}

User profile — targets per day: ${profile.targetCalories} kcal, ${profile.targetProtein}g protein, ${profile.targetFiber}g fiber.
Today's intakes: ${JSON.stringify(todayIntakes)}.
Last 7 days totals: ${JSON.stringify(weekTotals)}.
${question ? `User question: "${question}"` : 'No question — provide general analysis. Set answer to null.'}

Rules:
- pct is (today's total / daily target * 100), capped at 100
- gap is (target - actual) when under target, else null
- suggestions: always return exactly 3 meal ideas relevant to the biggest gap
- working.days: true means ≥80% of fiber target was hit on that day (oldest first, 7 days)
- Respond with ONLY the JSON object. No markdown fences.`;

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
    console.error('[insights] status:', e.response?.status);
    console.error('[insights] data:', JSON.stringify(e.response?.data, null, 2));
    const status = e.response?.status;
    if (status === 429) {
      res.status(429).json({ error: 'Too many requests — please wait a moment and try again.' });
    } else {
      res.status(422).json({ error: 'Could not generate insights. Try again later.' });
    }
  }
}
