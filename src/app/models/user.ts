interface AppUser {
  id: number;
  authId: string;
  code: string;
  name?: string;
  createdAt?: string;
}

interface UserProfile {
  id?: number;
  authId?: string;
  name?: string;
  age?: number | null;
  sex?: 'female' | 'male' | 'other' | null;
  heightCm?: number | null;
  weightKg?: number | null;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
  targetCalories: number;
  targetProtein: number;
  targetFiber: number;
}
