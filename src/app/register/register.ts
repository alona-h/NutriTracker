import { Component, inject, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Supabase } from '../services/supabase';
import { AuthService } from '../services/auth';

function passwordsMatch(form: AbstractControl) {
  const pw  = form.get('password')?.value;
  const cpw = form.get('confirmPassword')?.value;
  return pw === cpw ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private fb       = inject(FormBuilder);
  private supabase = inject(Supabase);
  private auth     = inject(AuthService);

  switchToLogin = output<void>();

  form = this.fb.group({
    name:            ['', [Validators.required, Validators.minLength(2)]],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  isLoading = signal(false);
  error     = signal<string | null>(null);
  success   = signal(false);

  private friendlyError(error: { code?: string; message: string }): string {
    switch (error.code) {
      case 'over_email_send_rate_limit':
        return 'Too many sign-up attempts. Please wait a few minutes and try again.';
      case 'user_already_exists':
      case 'email_exists':
        return 'An account with this email already exists. Try logging in instead.';
      case 'weak_password':
        return 'Password is too weak. Please choose a stronger password.';
      default:
        return error.message;
    }
  }

  get passwordMismatch(): boolean {
    return this.form.hasError('passwordMismatch') &&
           !!this.form.get('confirmPassword')?.dirty;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.error.set(null);

    const { name, email, password } = this.form.value;
    const { data, error } = await this.supabase.signUp(email!, password!);

    if (error) {
      this.error.set(this.friendlyError(error));
      this.isLoading.set(false);
      return;
    }

    if (data.user) {
      try {
        await this.supabase.createAppUser(name!, data.user.id);
      } catch {
        // User row may already exist or will be created on next login
      }
    }

    if (data.session) {
      await this.auth.refreshCurrentUser();
      // onAuthStateChange will unlock the app shell; isLoading stays true
      // so the spinner persists until the component unmounts
    } else {
      // Email confirmation required — show success notice
      this.success.set(true);
      this.isLoading.set(false);
    }
  }
}
