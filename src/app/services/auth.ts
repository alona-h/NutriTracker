import { Injectable, signal, inject } from '@angular/core';
import { Supabase } from './supabase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabaseService = inject(Supabase);

  currentUser = signal<AppUser | null>(null);

  /**
   * Initialise auth state listener. Call this once from app.ts ngOnInit.
   * Supabase automatically persists the session in localStorage —
   * no manual localStorage management is needed.
   */
  init(): void {
    // Restore existing session on page load
    this.supabaseService.authClient.getSession().then(({ data }) => {
      if (data.session) {
        this.loadUserProfile();
      }
    });

    // React to future sign-in / sign-out events
    this.supabaseService.authClient.onAuthStateChange((event, session) => {
      if (session) {
        this.loadUserProfile();
      } else {
        this.currentUser.set(null);
      }
    });
  }

  private async loadUserProfile(): Promise<void> {
    const user = await this.supabaseService.getUserProfile();
    this.currentUser.set(user);
  }

  async logout(): Promise<void> {
    await this.supabaseService.signOut();
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
}