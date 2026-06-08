import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Supabase {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // ── Auth ───────────────────────────────────────────────────

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  }

  async signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email: email.trim().toLowerCase(), password });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async createAppUser(name: string, authId: string): Promise<void> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 12);
    const code = slug + '_' + Math.random().toString(36).slice(2, 7);
    const { error } = await this.supabase.from('User').insert([{ auth_user_id: authId, name, code }]);
    if (error) throw error;
  }

  get authClient() {
    return this.supabase.auth;
  }

  // ── App user profile (User table) ──────────────────────────

  async getAppUser(): Promise<AppUser | null> {
    const { data, error } = await this.supabase
      .from('User')
      .select('id, auth_user_id, code, name, createdAt')
      .single();

    if (error || !data) return null;

    return {
      id: data['id'],
      authId: data['auth_user_id'],
      code: data['code'],
      name: data['name'],
      createdAt: data['createdAt'],
    } as AppUser;
  }

  // ── Nutrition profile / goals (user_profiles table) ────────

  async getNutritionProfile(): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('UserProfile')
      .select('*')
      .single();

    if (error || !data) return null;

    return {
      id:             data['id'],
      authId:         data['auth_user_id'],
      name:           data['name'],
      age:            data['age'],
      sex:            data['sex'],
      heightCm:       data['heightcm'],
      weightKg:       data['weightkg'],
      activityLevel:  data['activitylevel'],
      targetCalories: data['targetcalories'] ?? 2000,
      targetProtein:  data['targetprotein']  ?? 50,
      targetFiber:    data['targetfiber']    ?? 25,
    } as UserProfile;
  }

  async upsertNutritionProfile(profile: Partial<UserProfile>): Promise<void> {
    const { data: sessionData } = await this.supabase.auth.getSession();
    const authId = sessionData.session?.user?.id;
    if (!authId) throw new Error('Not authenticated');

    const { error } = await this.supabase
      .from('UserProfile')
      .upsert({
        auth_user_id:    authId,
        name:            profile.name,
        age:             profile.age,
        sex:             profile.sex,
        heightcm:        profile.heightCm,
        weightkg:        profile.weightKg,
        activitylevel:   profile.activityLevel,
        targetcalories:  profile.targetCalories,
        targetprotein:   profile.targetProtein,
        targetfiber:     profile.targetFiber,
      }, { onConflict: 'auth_user_id' });

    if (error) throw error;
  }

  // ── Food Facts ─────────────────────────────────────────────

  async getFoodFacts(): Promise<FoodItem[]> {
    const { data, error } = await this.supabase.from('FoodFact').select();
    if (error) {
      console.error('Error fetching food facts:', error);
      return [];
    }
    return data as FoodItem[];
  }

  async submitFoodFact(isEdit: boolean, fact: FoodItem): Promise<void> {
    if (isEdit) {
      await this.updateFoodFact(fact.id, fact);
    } else {
      await this.addFoodFact(fact);
    }
  }

  private async addFoodFact(fact: FoodItem): Promise<void> {
    const { error } = await this.supabase.from('FoodFact').insert([{
      name:              fact.name,
      servingSize:       fact.servingSize,
      unitOfMeasurement: fact.unitOfMeasurement,
      fiber:             fact.fiber,
      calories:          fact.calories,
      protein:           fact.protein,
    }]);
    if (error) console.error('Error adding food fact:', error);
  }

  private async updateFoodFact(id: number, fact: Partial<FoodItem>): Promise<void> {
    const { error } = await this.supabase.from('FoodFact').update(fact).eq('id', id);
    if (error) console.error('Error updating food fact:', error);
  }

  async deleteFoodFact(id: number): Promise<void> {
    const { error } = await this.supabase.from('FoodFact').delete().eq('id', id);
    if (error) console.error('Error deleting food fact:', error);
  }

  // ── Food Intakes ───────────────────────────────────────────

  async getFoodIntakes(): Promise<NutritionEntry[]> {
    const { data, error } = await this.supabase
      .from('FoodIntake')
      .select(`
        id,
        intakeSize,
        fiberIntake,
        calorieIntake,
        proteinIntake,
        createdAt,
        food:FoodFact (
          id, name, servingSize, unitOfMeasurement, fiber, calories, protein
        )
      `);

    if (error) {
      console.error('Error fetching food intakes:', error);
      return [];
    }

    return (data ?? []).map(item => ({
      ...item,
      food: Array.isArray(item['food']) ? item['food'][0] as FoodItem : item['food'] as FoodItem,
    })) as NutritionEntry[];
  }

  async submitFoodIntake(isEdit: boolean, intake: NutritionEntry): Promise<void> {
    if (isEdit) {
      await this.updateFoodIntake(intake.id, intake);
    } else {
      await this.addFoodIntake(intake);
    }
  }

  private async addFoodIntake(intake: Omit<NutritionEntry, 'id' | 'createdAt'>): Promise<void> {
    const { data: sessionData } = await this.supabase.auth.getSession();
    const authId = sessionData.session?.user?.id;
    if (!authId) {
      console.error('Cannot add food intake: no authenticated user');
      return;
    }

    const { error } = await this.supabase.from('FoodIntake').insert([{
      foodId:        intake.foodId,
      intakeSize:    intake.intakeSize,
      fiberIntake:   intake.fiberIntake,
      calorieIntake: intake.calorieIntake,
      proteinIntake: intake.proteinIntake,
      user_auth_id:  authId,
    }]);
    if (error) console.error('Error adding food intake:', error);
  }

  private async updateFoodIntake(id: number, intake: Partial<NutritionEntry>): Promise<void> {
    const { error } = await this.supabase.from('FoodIntake').update(intake).eq('id', id);
    if (error) console.error('Error updating food intake:', error);
  }

  async deleteFoodIntake(id: number): Promise<void> {
    const { error } = await this.supabase.from('FoodIntake').delete().eq('id', id);
    if (error) console.error('Error deleting food intake:', error);
  }

  // ── Daily totals for 7-day trend ───────────────────────────

  async getDailyTotals(daysBack: number = 7): Promise<DailyTotal[]> {
    const since = new Date();
    since.setDate(since.getDate() - daysBack + 1);
    const sinceStr = since.toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('FoodIntake')
      .select('calorieIntake, proteinIntake, fiberIntake, createdAt')
      .gte('createdAt', sinceStr);

    if (error) {
      console.error('Error fetching daily totals:', error);
      return [];
    }

    const map: Record<string, DailyTotal> = {};
    for (let i = 0; i < daysBack; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (daysBack - 1 - i));
      const key = d.toISOString().split('T')[0];
      map[key] = { date: key, calories: 0, protein: 0, fiber: 0 };
    }

    for (const row of data ?? []) {
      const key = (row['createdAt'] as string).split('T')[0];
      if (map[key]) {
        map[key].calories += row['calorieIntake'] ?? 0;
        map[key].protein  += row['proteinIntake']  ?? 0;
        map[key].fiber    += row['fiberIntake']    ?? 0;
      }
    }

    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }
}

interface DailyTotal {
  date:     string;
  calories: number;
  protein:  number;
  fiber:    number;
}
