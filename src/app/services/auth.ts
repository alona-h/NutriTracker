import { Injectable, signal, inject } from '@angular/core';
import { Supabase } from './supabase';

export const DEFAULT_PROFILE: UserProfile = {
  targetCalories: 2000,
  targetProtein:  50,
  targetFiber:    25,
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabaseService = inject(Supabase);

  currentUser    = signal<AppUser | null>(null);
  userProfile    = signal<UserProfile>(DEFAULT_PROFILE);

  init(): void {
    this.supabaseService.authClient.getSession().then(({ data }) => {
      if (data.session) {
        this.loadUserData();
      }
    });

    this.supabaseService.authClient.onAuthStateChange((_, session) => {
      if (session) {
        this.loadUserData();
      } else {
        this.currentUser.set(null);
        this.userProfile.set(DEFAULT_PROFILE);
      }
    });
  }

  private async loadUserData(): Promise<void> {
    const [user, profile] = await Promise.all([
      this.supabaseService.getAppUser(),
      this.supabaseService.getNutritionProfile(),
    ]);
    this.currentUser.set(user);
    this.userProfile.set(profile ?? DEFAULT_PROFILE);
  }

  async refreshProfile(): Promise<void> {
    const profile = await this.supabaseService.getNutritionProfile();
    this.userProfile.set(profile ?? DEFAULT_PROFILE);
  }

  async logout(): Promise<void> {
    await this.supabaseService.signOut();
    this.currentUser.set(null);
    this.userProfile.set(DEFAULT_PROFILE);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}
