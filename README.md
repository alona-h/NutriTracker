# NutriTracker

A lightweight Angular PWA for tracking daily food intake and fiber consumption.

---

## Features

- **Food Facts Database** — maintain a personal nutrition database with food names, serving sizes, units of measurement, and fiber content per serving.
- **Food Intake Tracking** — log daily food consumption and automatically calculate fiber intake based on portion size relative to the serving defined in the database.
- **Today's Summary** — a stats strip shows the number of entries logged today and the total fiber consumed.
- **Browse by Date** — a date picker lets you review entries and fiber totals for any past day.
- **Dark / Light Mode** — a sidebar toggle switches between dark and light themes with smooth CSS transitions.
- **PWA support** — includes a web manifest and app icons for installation on mobile and desktop.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular (standalone components, signals) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Fonts | Plus Jakarta Sans, Sora (Google Fonts) |
| Forms | Angular Reactive Forms |
| Routing | Angular Router with `routerLinkActive` |
| PWA | Web App Manifest |

---

## Pages

### Food Facts (`/food-facts`)
Displays a table of all foods in the nutrition database. Each row shows the food name, serving size, unit, and fiber content. Inline add and edit forms allow managing entries without leaving the page.

### Food Intake (`/food-intake`)
Shows today's logged entries with a running fiber total. An inline form lets you select a food from the database and enter a portion size — fiber intake is calculated automatically. A separate "Browse by Date" card lets you view historical entries.

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

## Theme

The app uses CSS custom properties for theming. The dark/light mode toggle lives in the sidebar footer and applies a `.dark` class to the document root, switching all surface, border, and text colors via the token definitions in `styles.css`.

---

## PWA

A `manifest.webmanifest` and app icons (including `apple-touch-icon`) are included, making the app installable as a Progressive Web App on both iOS and Android.