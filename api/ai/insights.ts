import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

    const apiKey = process.env['GEMINI_API_KEY'] ?? '';
    const { data } = await axios.post(
      `${GEMINI_URL}?key=${apiKey}`,
      { contents: [{ parts: [{ text: prompt }] }] },
    );

    const raw  = (data as { candidates: { content: { parts: { text: string }[] } }[] })
      .candidates[0].content.parts[0].text.trim();
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(text);
    res.status(200).json(parsed);
  } catch (err) {
    console.error('[insights]', err);
    res.status(422).json({ error: 'Could not generate insights. Try again later.' });
  }
}
