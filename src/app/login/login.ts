import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private supabase = inject(Supabase);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  isLoading = signal(false);
  error     = signal<string | null>(null);

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.error.set(null);

    const { error } = await this.supabase.signIn(
      this.form.value.email!,
      this.form.value.password!,
    );

    if (error) {
      this.error.set('Invalid email or password. Please try again.');
      this.isLoading.set(false);
    }
    // On success AuthService.onAuthStateChange fires and shows the app shell.
  }
}
