import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  private fb       = inject(FormBuilder);
  private supabase = inject(Supabase);
  private auth     = inject(AuthService);

  saving  = signal(false);
  saved   = signal(false);

  form = this.fb.group({
    name:           [''],
    age:            [null as number | null, [Validators.min(1), Validators.max(120)]],
    sex:            [null as string | null],
    heightCm:       [null as number | null, [Validators.min(50), Validators.max(300)]],
    weightKg:       [null as number | null, [Validators.min(10), Validators.max(500)]],
    activityLevel:  [null as string | null],
    targetCalories: [2000, [Validators.required, Validators.min(500)]],
    targetProtein:  [50,   [Validators.required, Validators.min(0)]],
    targetFiber:    [25,   [Validators.required, Validators.min(0)]],
  });

  activityLevels = [
    { value: 'sedentary',  label: 'Sedentary',        desc: 'Little or no exercise' },
    { value: 'light',      label: 'Lightly active',   desc: '1-3 days/week' },
    { value: 'moderate',   label: 'Moderately active', desc: '3-5 days/week' },
    { value: 'active',     label: 'Active',            desc: '6-7 days/week' },
    { value: 'very_active', label: 'Very active',      desc: 'Hard exercise daily' },
  ];

  ngOnInit(): void {
    const profile = this.auth.userProfile();
    this.form.patchValue({
      name:           profile.name ?? '',
      age:            profile.age ?? null,
      sex:            profile.sex ?? null,
      heightCm:       profile.heightCm ?? null,
      weightKg:       profile.weightKg ?? null,
      activityLevel:  profile.activityLevel ?? null,
      targetCalories: profile.targetCalories,
      targetProtein:  profile.targetProtein,
      targetFiber:    profile.targetFiber,
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.saved.set(false);

    const v = this.form.value;
    await this.supabase.upsertNutritionProfile({
      name:           v.name || undefined,
      age:            v.age ?? undefined,
      sex:            (v.sex as UserProfile['sex']) ?? undefined,
      heightCm:       v.heightCm ?? undefined,
      weightKg:       v.weightKg ?? undefined,
      activityLevel:  (v.activityLevel as UserProfile['activityLevel']) ?? undefined,
      targetCalories: v.targetCalories!,
      targetProtein:  v.targetProtein!,
      targetFiber:    v.targetFiber!,
    });

    await this.auth.refreshProfile();
    this.saving.set(false);
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);
  }
}
