import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-user-code',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-code.html',
})
export class UserCodeComponent {
  private fb = inject(FormBuilder);
  private supabase = inject(Supabase);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(1)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isLoading = signal(false);
  error = signal<string | null>(null);

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.error.set(null);

    const username = this.form.value.username!;
    const password = this.form.value.password!;

    const { error } = await this.supabase.signIn(username, password);

    if (error) {
      this.error.set('Invalid username or password. Please try again.');
      this.isLoading.set(false);
    }
    // On success: AuthService.onAuthStateChange fires automatically,
    // sets currentUser, and the app shell shows the main view.
  }
}