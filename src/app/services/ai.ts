import { Injectable } from '@angular/core';
import axios from 'axios';

export interface AutofillResult {
  servingSize:       number;
  unitOfMeasurement: string;
  calories:          number;
  protein:           number;
  fiber:             number;
}

export interface InsightsRequest {
  profile: {
    targetCalories: number;
    targetProtein:  number;
    targetFiber:    number;
  };
  todayIntakes: { name: string; calories: number; protein: number; fiber: number }[];
  weekTotals:   { date: string; calories: number; protein: number; fiber: number }[];
  question?:    string;
}

export interface MacroStatus {
  pct:   number;
  label: string;
  gap:   number | null;
}

export interface InsightResponse {
  headline:          string;
  analyzedAgo:       string;
  macroStatus: {
    calories: MacroStatus;
    protein:  MacroStatus;
    fiber:    MacroStatus;
  };
  suggestionContext: string;
  suggestions: {
    name:     string;
    calories: number;
    protein:  number;
    fiber:    number;
    note:     string;
  }[];
  working: {
    title: string;
    body:  string;
    days:  boolean[];
  };
  watch: {
    title: string;
    body:  string;
  };
  answer: string | null;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  async autofillFood(name: string): Promise<AutofillResult> {
    const { data } = await axios.post<AutofillResult>('/api/ai/autofill-food', { name });
    return data;
  }

  async getInsights(payload: InsightsRequest): Promise<InsightResponse> {
    const { data } = await axios.post<InsightResponse>('/api/ai/insights', payload);
    return data;
  }
}
