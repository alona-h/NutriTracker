import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class Supabase {
  private supabase: SupabaseClient;
  
  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

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

  private async addFoodFact(fact: FoodFact): Promise<void> {
    console.log('Adding food fact:', fact);
    const { error } = await this.supabase
      .from('FoodFact')
      .insert([
        {
          name: fact.name,
          servingSize: fact.servingSize,
          unitOfMeasurement: fact.unitOfMeasurement,
          fiber: fact.fiber
        }
      ]);

    if (error) {
      console.error('Error adding food fact:', error);
    }
  }

  async submitFoodFact(isEdit: boolean, fact: FoodFact): Promise<void> {
    if (isEdit) {
      await this.updateFoodFact(fact.id, fact);
    } else {
      await this.addFoodFact(fact);
    }
  }

  private async updateFoodFact(id: number, fact: Partial<FoodFact>): Promise<void> {
    const { error } = await this.supabase
      .from('FoodFact')
      .update(fact)
      .eq('id', id);

    if (error) {
      console.error('Error updating food fact:', error);
    }
  }

  async deleteFoodFact(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('FoodFact')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting food fact:', error);
    }
  }

  async getFoodIntakes(): Promise<FoodIntake[]> {
    const { data, error } = await this.supabase
      .from('FoodIntake')
      .select(`
        id,
        intakeSize,
        fiberIntake,
        createdAt,
        food:FoodFact (
          id,
          name,
          servingSize,
          unitOfMeasurement,
          fiber
        )
      `);
    console.log('Fetched food intakes:', data, 'Error:', error);

    if (error) {
      console.error('Error fetching food intakes:', error);
      return [];
    }

    var foodIntakes = (data ?? []).map(item => ({
      ...item,
      food: Array.isArray(item.food) ? item.food[0] as FoodFact : item.food as FoodFact,
    })) as FoodIntake[];

    console.log('Processed food intakes:', foodIntakes);
    return foodIntakes;
  }

  async submitFoodIntake(isEdit: boolean, intake: FoodIntake): Promise<void> {
    if (isEdit) {
      await this.updateFoodIntake(intake.id, intake);
    } else {
      await this.addFoodIntake(intake);
    }
  }

  private async addFoodIntake(intake: Omit<FoodIntake, 'id' | 'createdAt'>): Promise<void> {
    console.log('Adding food intake:', intake);
    const { error } = await this.supabase
      .from('FoodIntake')
      .insert([
        {
          foodId: intake.foodId,
          intakeSize: intake.intakeSize,
          fiberIntake: intake.fiberIntake
        }
      ]);

    if (error) {
      console.error('Error adding food intake:', error);
    }
  }

  private async updateFoodIntake(id: number, intake: Partial<FoodIntake>): Promise<void> {
    const { error } = await this.supabase
      .from('FoodIntake')
      .update(intake)
      .eq('id', id);

    if (error) {
      console.error('Error updating food intake:', error);
    }
  }

  async deleteFoodIntake(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('FoodIntake')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting food intake:', error);
    }
  }
}
