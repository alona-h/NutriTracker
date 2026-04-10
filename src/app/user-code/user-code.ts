import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Supabase } from '../services/supabase';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-user-code',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-code.html',
})
export class UserCodeComponent {
  private fb = inject(FormBuilder);
  private supabase = inject(Supabase);
  private auth = inject(AuthService);

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(1)]],
  });

  isLoading = signal(false);
  error = signal<string | null>(null);

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.error.set(null);

    const code = this.form.value.code!.trim().toUpperCase();
    const user = await this.supabase.getUserByCode(code);

    if (user) {
      this.auth.setUser(user);
    } else {
      this.error.set('Invalid code. Please check and try again.');
      this.isLoading.set(false);
    }
  }
}