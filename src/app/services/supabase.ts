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

  /**
   * Sign in using a username (the user's code) and password.
   * Internally, the username is mapped to a synthetic email:
   * e.g. "ALICE42" → "alice42@nutritracker.local"
   */
  async signIn(username: string, password: string) {
    const email = `${username.trim().toLowerCase()}@nutritracker.local`;
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  /**
   * Returns the Supabase auth client so AuthService can subscribe to
   * onAuthStateChange for reactive session management.
   */
  get authClient() {
    return this.supabase.auth;
  }

  // ── Users ──────────────────────────────────────────────────

  /**
   * Fetches the User profile row for the currently authenticated user.
   * RLS ensures only the matching row is returned.
   */
  async getUserProfile(): Promise<AppUser | null> {
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

  // ── Food Facts (shared, readable by all authenticated users) ──

  async getFoodFacts(): Promise<FoodFact[]> {
    const { data, error } = await this.supabase
      .from('FoodFact')
      .select();

    if (error) {
      console.error('Error fetching food facts:', error);
      return [];
    }
    return data as FoodFact[];
  }

  async submitFoodFact(isEdit: boolean, fact: FoodFact): Promise<void> {
    if (isEdit) {
      await this.updateFoodFact(fact.id, fact);
    } else {
      await this.addFoodFact(fact);
    }
  }

  private async addFoodFact(fact: FoodFact): Promise<void> {
    const { error } = await this.supabase
      .from('FoodFact')
      .insert([{
        name: fact.name,
        servingSize: fact.servingSize,
        unitOfMeasurement: fact.unitOfMeasurement,
        fiber: fact.fiber,
        calories: fact.calories,
        protein: fact.protein,
      }]);

    if (error) console.error('Error adding food fact:', error);
  }

  private async updateFoodFact(id: number, fact: Partial<FoodFact>): Promise<void> {
    const { error } = await this.supabase
      .from('FoodFact')
      .update(fact)
      .eq('id', id);

    if (error) console.error('Error updating food fact:', error);
  }

  async deleteFoodFact(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('FoodFact')
      .delete()
      .eq('id', id);

    if (error) console.error('Error deleting food fact:', error);
  }

  // ── Food Intakes (RLS scoped to authenticated user) ──────────

  /**
   * Fetches food intakes for the current user.
   * RLS automatically filters to rows where user_auth_id = auth.uid().
   */
  async getFoodIntakes(): Promise<FoodIntake[]> {
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
          id,
          name,
          servingSize,
          unitOfMeasurement,
          fiber,
          calories,
          protein
        )
      `);

    if (error) {
      console.error('Error fetching food intakes:', error);
      return [];
    }

    return (data ?? []).map(item => ({
      ...item,
      food: Array.isArray(item['food']) ? item['food'][0] as FoodFact : item['food'] as FoodFact,
    })) as FoodIntake[];
  }

  async submitFoodIntake(
    isEdit: boolean,
    intake: FoodIntake,
  ): Promise<void> {
    if (isEdit) {
      await this.updateFoodIntake(intake.id, intake);
    } else {
      await this.addFoodIntake(intake);
    }
  }

  private async addFoodIntake(
    intake: Omit<FoodIntake, 'id' | 'createdAt'>,
  ): Promise<void> {
    // Get the current auth session to populate user_auth_id
    const { data: sessionData } = await this.supabase.auth.getSession();
    const authId = sessionData.session?.user?.id;
    if (!authId) {
      console.error('Cannot add food intake: no authenticated user');
      return;
    }

    const { error } = await this.supabase
      .from('FoodIntake')
      .insert([{
        foodId: intake.foodId,
        intakeSize: intake.intakeSize,
        fiberIntake: intake.fiberIntake,
        calorieIntake: intake.calorieIntake,
        proteinIntake: intake.proteinIntake,
        user_auth_id: authId,
      }]);

    if (error) console.error('Error adding food intake:', error);
  }

  private async updateFoodIntake(
    id: number,
    intake: Partial<FoodIntake>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('FoodIntake')
      .update(intake)
      .eq('id', id);

    if (error) console.error('Error updating food intake:', error);
  }

  async deleteFoodIntake(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('FoodIntake')
      .delete()
      .eq('id', id);

    if (error) console.error('Error deleting food intake:', error);
  }
}