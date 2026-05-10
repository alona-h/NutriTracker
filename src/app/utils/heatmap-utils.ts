export interface HeatmapDay {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  value: number;
  level: number; // 0 (empty), 1, 2, 3, 4 (darkest)
  isFuture: boolean;
}

export interface HeatmapWeek {
  days: (HeatmapDay | null)[];
}

/**
 * Generates a GitHub-style heatmap grid.
 * The grid always ends on the current week.
 * The total days covered is roughly 365 days, extending back to the Sunday of the week containing the date 365 days ago.
 */
export function generateHeatmapGrid(
  dataMap: Record<string, number>, // dateStr -> value
  maxValue: number,
  daysCount: number = 365
): HeatmapWeek[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start date: daysCount days ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (daysCount - 1));

  // Adjust startDate to the previous Sunday (0 = Sunday in JS)
  const startDayOfWeek = startDate.getDay();
  if (startDayOfWeek !== 0) {
    startDate.setDate(startDate.getDate() - startDayOfWeek);
  }

  const weeks: HeatmapWeek[] = [];
  let currentWeek: HeatmapWeek = { days: [] };
  
  let current = new Date(startDate);
  
  // We want to generate days until the end of the week that contains `today`
  // That means we go up to the Saturday following `today`.
  const endDate = new Date(today);
  const endDayOfWeek = endDate.getDay();
  if (endDayOfWeek !== 6) {
    endDate.setDate(endDate.getDate() + (6 - endDayOfWeek));
  }

  while (current <= endDate) {
    const dateStr = formatDateStr(current);
    const isFuture = current > today;
    
    let dayData: HeatmapDay | null = null;
    
    if (!isFuture) {
      const value = dataMap[dateStr] || 0;
      let level = 0;
      if (value > 0) {
        // Linear scale 1 to 4 based on maxValue
        // level = 1 + floor((value / max) * 3), max 4
        // To be exactly like github:
        // level 1: > 0 up to 25% of max
        // level 2: 25% to 50%
        // level 3: 50% to 75%
        // level 4: 75%+ 
        const ratio = Math.min(value / maxValue, 1);
        if (ratio <= 0) level = 0;
        else if (ratio <= 0.25) level = 1;
        else if (ratio <= 0.5) level = 2;
        else if (ratio <= 0.75) level = 3;
        else level = 4;
      }

      dayData = {
        date: new Date(current),
        dateStr,
        value,
        level,
        isFuture
      };
    }

    currentWeek.days.push(dayData);

    if (currentWeek.days.length === 7) {
      weeks.push(currentWeek);
      currentWeek = { days: [] };
    }

    current.setDate(current.getDate() + 1);
  }

  return weeks;
}

function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
