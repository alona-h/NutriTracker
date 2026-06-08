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
  aiEnabled      = signal<boolean>(this.readAiEnabled());
  hasSession     = signal(false);

  private readAiEnabled(): boolean {
    try { return localStorage.getItem('ai_enabled') !== 'false'; } catch { return true; }
  }

  setAiEnabled(value: boolean): void {
    try { localStorage.setItem('ai_enabled', String(value)); } catch { /* SSR */ }
    this.aiEnabled.set(value);
  }

  init(): void {
    this.supabaseService.authClient.getSession().then(({ data }) => {
      this.hasSession.set(!!data.session);
      if (data.session) {
        this.loadUserData();
      }
    });

    this.supabaseService.authClient.onAuthStateChange((_, session) => {
      this.hasSession.set(!!session);
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
    this.hasSession.set(false);
  }

  isAuthenticated(): boolean {
    return this.hasSession();
  }

  async refreshCurrentUser(): Promise<void> {
    await this.loadUserData();
  }
}
