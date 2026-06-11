# NutriTracker

NutriTracker is a personal nutrition tracking app built with Angular and Supabase. You log your meals, track your daily macros against your own targets, review how the week is trending, and ask an AI assistant for coaching along the way.

---

## Features

### Daily Summary
- Goal rings show today's progress toward your calorie, protein, and fiber targets.
- A 7-day bar chart plots calories, protein, and fiber per day on a shared scale, with a target line and tooltips that show exact values and percent of goal.
- A date strip lets you browse any of the last 7 days and see that day's totals and entries.

### Nutrition Log
- Log a food by picking it from your database and entering a portion size.
- Edit or delete any logged entry from a modal.
- Pick a date to log or review entries for any past day.
- A totals strip shows progress bars for calories, protein, and fiber on the selected date.

### Food Database
- Keep a personal library of foods with serving size, unit, calories, protein, and fiber.
- Add, edit, and delete foods from a modal form.
- Search by name to filter the list as you type.
- Use AI autofill to estimate a food's nutrition from its name, then adjust the values before saving.

### AI Insights
- Get an analysis of your profile, today's intake, and the last 7 days of totals.
- See per-macro status with percent of target, the gap left to close, and an on-track or over-target label.
- Receive three meal suggestions aimed at your biggest macro gap.
- Read "what's working" and "watch" notes, including a 7-day fiber consistency strip.
- Ask free-form questions in chat and get answers grounded in your own data.

### Profile and Goals
- Set your daily targets for calories, protein, and fiber, used everywhere progress is shown.
- Add optional details like name, age, sex, height, weight, and activity level.
- Turn AI features on or off whenever you want.

### Accounts
- Register with your name, email, and password, with email confirmation when required.
- Log in with email and password through Supabase Auth.
- Stay signed in across page loads, with the app gated behind authentication.

### App Shell
- Navigate with a collapsible sidebar on desktop and a bottom tab bar on mobile.
- Switch between light and night mode, with your choice remembered between visits.

---

## Tech Stack

- Angular 21
- Supabase (PostgreSQL and Auth)
- Groq API for AI features
- Tailwind CSS
- Deployed on Vercel

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/summary` | Daily Summary | Goal rings, 7-day trend chart, date strip, and entries list |
| `/log` | Nutrition Log | Log and manage food entries by date |
| `/foods` | Food Database | Manage your food library, with AI autofill |
| `/insights` | AI Insights | AI analysis, meal suggestions, and chat |
| `/profile` | Profile and Goals | Personal details, daily targets, and the AI toggle |

The older routes `/dashboard`, `/food-intake`, and `/food-facts` redirect to their current equivalents.

---

## Getting Started

### 1. Set environment variables

Create a `.env.local` file in the project root:

```bash
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
GROQ_API_KEY=your-groq-api-key
```

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are written into `src/environments/environment.ts` by `scripts/generate-env.js`, which runs automatically during `npm run build`. `GROQ_API_KEY` is used by the API server for AI features.

### 2. Install and run

```bash
# Install dependencies
npm install

# Start the Angular dev server
npm run start

# In a second terminal, start the local API server for AI features
npx tsx api/local-server.ts

# Build for production
npm run build
```

The app runs at `http://localhost:4200` and the API server runs at `http://localhost:3001`. The dev server forwards `/api` requests to the API server using `proxy.conf.json`.

---

## API

The AI features are served by functions under `api/`. They run as Vercel serverless functions in production and through `api/local-server.ts` in development.

| Endpoint | Description |
|---|---|
| `POST /api/ai/autofill-food` | Estimates nutrition facts for a given food name |
| `POST /api/ai/insights` | Generates the nutrition analysis and answers chat questions |

Both endpoints call the Groq API with `GROQ_API_KEY` and return structured JSON.

---

## Data Model

### `FoodFact`
Holds the food library. Each row stores `name`, `servingSize`, `unitOfMeasurement`, `calories`, `protein`, and `fiber`, all per serving.

### `FoodIntake`
Holds each logged entry. Each row stores `foodId`, `intakeSize` (the actual portion), and the precomputed `calorieIntake`, `proteinIntake`, and `fiberIntake`, scaled from the food's per-serving values by the ratio of portion to serving size. Entries link to the signed-in user through `user_auth_id`.

### `user_profiles`
Holds each user's daily targets (`target_calories`, `target_protein`, `target_fiber`) and optional personal details. Keyed on `auth_id` and upserted on conflict.

---

## PWA

The app ships with a `manifest.webmanifest` and app icons, including an `apple-touch-icon`, so it can be installed on iOS, Android, and desktop browsers.
