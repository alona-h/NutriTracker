import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Supabase } from '../services/supabase';
import { AuthService } from '../services/auth';
import { Utils } from '../utils/utils';

interface DailyTotal {
  date: string;
  calories: number;
  protein: number;
  fiber: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private supabase = inject(Supabase);
  private auth     = inject(AuthService);

  loading      = signal(true);
  allIntakes   = signal<NutritionEntry[]>([]);
  weekTotals   = signal<DailyTotal[]>([]);
  selectedDate = signal<string>(Utils.toDateString(new Date()));

  userProfile  = computed(() => this.auth.userProfile());

  readonly today = Utils.toDateString(new Date());

  // Last 7 days as date strings for the date strip
  dateStrip = computed<string[]>(() => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(Utils.toDateString(d));
    }
    return days;
  });

  selectedDateIntakes = computed(() =>
    this.allIntakes().filter(i => Utils.toDateString(i.createdAt) === this.selectedDate())
  );

  todayTotals = computed(() => this.totalsForDate(this.today));
  selectedTotals = computed(() => this.totalsForDate(this.selectedDate()));

  private totalsForDate(dateStr: string) {
    const intakes = this.allIntakes().filter(i => Utils.toDateString(i.createdAt) === dateStr);
    return intakes.reduce(
      (acc, i) => {
        const ratio = i.intakeSize / i.food.servingSize;
        return {
          calories: acc.calories + i.food.calories * ratio,
          protein:  acc.protein  + i.food.protein  * ratio,
          fiber:    acc.fiber    + i.food.fiber     * ratio,
        };
      },
      { calories: 0, protein: 0, fiber: 0 },
    );
  }

  ringPct(value: number, target: number): number {
    return Math.min(100, target > 0 ? Math.round((value / target) * 100) : 0);
  }

  // SVG arc helper — returns the stroke-dashoffset for a 36px radius circle
  readonly circumference = 2 * Math.PI * 88;

  ringOffset(pct: number): number {
    return this.circumference - (pct / 100) * this.circumference;
  }

  // Combined trend scale: max ratio (value/target) across all macros and all days
  private trendCombinedScale = computed(() => {
    const profile = this.userProfile();
    const targets = {
      calories: profile.targetCalories || 1,
      protein:  profile.targetProtein  || 1,
      fiber:    profile.targetFiber    || 1,
    };
    let maxRatio = 0;
    for (const day of this.weekTotals()) {
      maxRatio = Math.max(maxRatio,
        day.calories / targets.calories,
        day.protein  / targets.protein,
        day.fiber    / targets.fiber,
      );
    }
    return Math.max(maxRatio * 1.05, 1.2);
  });

  // Bar height as % of chart area — value/target as fraction of scale
  trendBarPct(value: number, target: number): number {
    if (target <= 0) return 0;
    return Math.min(100, ((value / target) / this.trendCombinedScale()) * 100);
  }

  // Percentage of target achieved (uncapped for display)
  trendPct(value: number, target: number): number {
    if (target <= 0) return 0;
    return Math.round((value / target) * 100);
  }

  // Target line position from the bottom as % of chart area (same for all macros)
  trendTargetLinePct = computed(() =>
    Math.min(100, (1 / this.trendCombinedScale()) * 100)
  );

  dayLabel(dateStr: string): string {
    if (dateStr === this.today) return 'Today';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  }

  async ngOnInit(): Promise<void> {
    const [intakes, weekTotals] = await Promise.all([
      this.supabase.getFoodIntakes(),
      this.supabase.getDailyTotals(7),
    ]);
    this.allIntakes.set(intakes);
    this.weekTotals.set(weekTotals);
    this.loading.set(false);
  }
}
