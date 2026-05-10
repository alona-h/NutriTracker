import { Component, inject, OnInit, signal } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { Supabase } from '../services/supabase';
import { AuthService } from '../services/auth';
import { HeatmapWeek, generateHeatmapGrid } from '../utils/heatmap-utils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private supabase = inject(Supabase);
  private auth = inject(AuthService);

  fiberWeeks = signal<HeatmapWeek[]>([]);
  calorieWeeks = signal<HeatmapWeek[]>([]);

  loading = signal<boolean>(true);

  // Define max values for scaling
  public readonly MAX_FIBER = 25;
  public readonly MAX_CALORIES = 4000;

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    const user = this.auth.currentUser();
    if (!user) {
      this.loading.set(false);
      return;
    }

    try {
      const intakes = await this.supabase.getFoodIntakes();

      const fiberMap: Record<string, number> = {};
      const calorieMap: Record<string, number> = {};

      for (const intake of intakes) {
        // extract 'YYYY-MM-DD' from 'YYYY-MM-DDTHH:mm:ss...'
        const dateStr = intake.createdAt.split('T')[0];

        if (!fiberMap[dateStr]) fiberMap[dateStr] = 0;
        if (!calorieMap[dateStr]) calorieMap[dateStr] = 0;

        fiberMap[dateStr] += (intake.fiberIntake || 0);
        calorieMap[dateStr] += (intake.calorieIntake || 0);
      }

      const fWeeks = generateHeatmapGrid(fiberMap, this.MAX_FIBER, 365);
      const cWeeks = generateHeatmapGrid(calorieMap, this.MAX_CALORIES, 365);

      this.fiberWeeks.set(fWeeks);
      this.calorieWeeks.set(cWeeks);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      this.loading.set(false);
    }
  }

  // Weekdays header: 0=Sun to 6=Sat
  // We usually label Mon, Wed, Fri
  dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}
