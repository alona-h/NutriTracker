import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Supabase } from '../services/supabase';
import { AuthService } from '../services/auth';
import { GeminiService, InsightResponse, InsightsRequest } from '../services/gemini';

interface ChatEntry {
  q: string;
  a: string;
}

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './insights.html',
  styleUrl: './insights.css',
})
export class InsightsComponent implements OnInit {
  private supabase = inject(Supabase);
  private auth     = inject(AuthService);
  private gemini   = inject(GeminiService);

  loadingAnalysis = signal(false);
  insight         = signal<InsightResponse | null>(null);
  error           = signal<string | null>(null);

  chatHistory   = signal<ChatEntry[]>([]);
  questionInput = signal('');
  loadingAnswer = signal(false);

  ngOnInit(): void {
    this.loadInsights();
  }

  async loadInsights(): Promise<void> {
    this.loadingAnalysis.set(true);
    this.error.set(null);
    this.insight.set(null);

    try {
      const payload = await this.buildPayload();
      const data    = await this.gemini.getInsights(payload);
      this.insight.set(data);
    } catch {
      this.error.set('Could not load insights. Check your connection and try again.');
    } finally {
      this.loadingAnalysis.set(false);
    }
  }

  async ask(): Promise<void> {
    const question = this.questionInput().trim();
    if (!question || this.loadingAnswer()) return;

    this.loadingAnswer.set(true);

    try {
      const payload = await this.buildPayload(question);
      const data    = await this.gemini.getInsights(payload);
      this.chatHistory.update(h => [...h, { q: question, a: data.answer ?? '' }]);
      this.questionInput.set('');
    } catch {
      this.chatHistory.update(h => [
        ...h,
        { q: question, a: 'Sorry, I could not answer that. Please try again.' },
      ]);
    } finally {
      this.loadingAnswer.set(false);
    }
  }

  refresh(): void {
    this.loadInsights();
  }

  private async buildPayload(question?: string): Promise<InsightsRequest> {
    const [weekTotals, allIntakes] = await Promise.all([
      this.supabase.getDailyTotals(7),
      this.supabase.getFoodIntakes(),
    ]);

    const today        = new Date().toISOString().split('T')[0];
    const todayIntakes = allIntakes
      .filter(e => (e.createdAt as string).startsWith(today))
      .map(e => ({
        name:     e.food?.name ?? 'Unknown',
        calories: e.calorieIntake ?? 0,
        protein:  e.proteinIntake  ?? 0,
        fiber:    e.fiberIntake     ?? 0,
      }));

    const profile = this.auth.userProfile();

    return {
      profile: {
        targetCalories: profile.targetCalories,
        targetProtein:  profile.targetProtein,
        targetFiber:    profile.targetFiber,
      },
      todayIntakes,
      weekTotals,
      ...(question ? { question } : {}),
    };
  }
}
