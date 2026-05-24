# NutriTracker

A personal nutrition tracking PWA built with Angular and Supabase. Log meals, monitor macros against daily targets, and review trends over time.

---

## Features

### Daily Summary
- Goal rings showing today's progress toward calorie, protein, and fiber targets
- 7-day grouped bar chart with calories, protein, and fiber per day — bars are normalized to a shared scale with a target-line overlay; hover tooltips show exact values and % of goal
- Date strip to browse any of the last 7 days and see that day's macro totals and logged entries

### Nutrition Log
- Log food entries by selecting a food from the database and entering a portion size
- Edit or delete any logged entry through a modal
- Date picker to log or review entries for any past date
- Per-date totals strip with progress bars for calories, protein, and fiber

### Food Database
- Personal library of foods with name, serving size, unit of measurement, calories, protein, and fiber per serving
- Add, edit, and delete foods via a modal form
- Live search to filter foods by name

### Profile & Goals
- Set personal daily targets for calories, protein, and fiber, used across all progress bars and goal rings
- Optional personal attributes: name, age, sex, height, weight, and activity level

### Authentication
- Email and password login via Supabase Auth
- Session persisted across page loads; protected routes redirect unauthenticated users to login

### App Shell
- Collapsible sidebar navigation on desktop; bottom tab bar on mobile
- Light / Night mode toggle — persisted in `localStorage`; native browser widgets (date pickers, number inputs) adopt dark styling automatically in Night mode

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone components, signals) |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| Styling | CSS custom properties (design token system) |
| Fonts | Plus Jakarta Sans, Sora (Google Fonts) |
| Forms | Angular Reactive Forms |
| Routing | Angular Router |
| PWA | Web App Manifest + app icons |
| SSR | Angular SSR (Express) |

---

## Pages

| Route | Component | Description |
|---|---|---|
| `/summary` | Daily Summary | Goal rings, 7-day trend chart, date strip, entries list |
| `/log` | Nutrition Log | Log and manage food entries by date |
| `/foods` | Food Database | Manage the personal food library |
| `/insights` | Insights | Placeholder for future AI-powered analysis |
| `/profile` | Profile & Goals | Personal info and daily macro targets |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run start

# Build for production
npm run build
```

The app will be available at `http://localhost:4200`.

---

## Data Model

### `FoodFact` table
Stores the food library. Each row has `name`, `servingSize`, `unitOfMeasurement`, `calories`, `protein`, and `fiber` (all per one serving).

### `FoodIntake` table
Each logged entry records `foodId`, `intakeSize` (the actual portion), and pre-computed `calorieIntake`, `proteinIntake`, and `fiberIntake` (scaled from the food's per-serving values by the ratio of portion to serving size). Linked to the authenticated user via `user_auth_id`.

### `user_profiles` table
Stores the user's daily targets (`target_calories`, `target_protein`, `target_fiber`) and optional personal attributes. Keyed on `auth_id` with an upsert on conflict.

---

## PWA

A `manifest.webmanifest` and app icons (including `apple-touch-icon`) are included, making the app installable on iOS, Android, and desktop browsers.
