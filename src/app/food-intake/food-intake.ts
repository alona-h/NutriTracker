import { Component, OnInit, signal, inject, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Supabase } from '../services/supabase';
import { Utils } from '../utils/utils';
import { SearchableSelectComponent, SelectOption } from '../shared/searchable-select';

@Component({
  selector: 'app-food-intake',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, FormsModule, SearchableSelectComponent],
  templateUrl: './food-intake.html',
  styleUrl: './food-intake.css',
})
export class FoodIntakeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private supabase = inject(Supabase);

  @ViewChild('formSection') formSectionRef!: ElementRef<HTMLElement>;

  foodIntakes = signal<FoodIntake[]>([]);
  foodFacts = signal<FoodFact[]>([]);
  foodIntakeForm!: FormGroup;
  isEditing = false;

  readonly today = Utils.toDateString(new Date());
  readonly yesterday = Utils.toDateString(new Date(Date.now() - 86400000));
  selectedDate = signal<string>(this.yesterday);

  foodFactOptions = computed<SelectOption[]>(() =>
    this.foodFacts().map(f => ({
      value: f.id,
      label: `${f.name} (${f.unitOfMeasurement})`,
    }))
  );

  todayIntakes = computed(() =>
    this.foodIntakes().filter(i => Utils.toDateString(i.createdAt) === this.today)
  );

  selectedDateIntakes = computed(() => {
    if (!this.selectedDate()) return [];
    return this.foodIntakes().filter(
      i => Utils.toDateString(i.createdAt) === this.selectedDate()
    );
  });

  todayFiberIntake = computed(() =>
    this.todayIntakes().reduce((sum, i) => {
      const ratio = i.intakeSize / i.food.servingSize;
      return sum + i.food.fiber * ratio;
    }, 0)
  );

  todayCalorieIntake = computed(() =>
    this.todayIntakes().reduce((sum, i) => {
      const ratio = i.intakeSize / i.food.servingSize;
      return sum + i.food.calories * ratio;
    }, 0)
  );

  todayProteinIntake = computed(() =>
    this.todayIntakes().reduce((sum, i) => {
      const ratio = i.intakeSize / i.food.servingSize;
      return sum + i.food.protein * ratio;
    }, 0)
  );

  selectedDateFiberIntake = computed(() => {
    if (!this.selectedDate()) return 0;
    return this.selectedDateIntakes().reduce((sum, i) => {
      const ratio = i.intakeSize / i.food.servingSize;
      return sum + i.food.fiber * ratio;
    }, 0);
  });

  selectedDateCalorieIntake = computed(() => {
    if (!this.selectedDate()) return 0;
    return this.selectedDateIntakes().reduce((sum, i) => {
      const ratio = i.intakeSize / i.food.servingSize;
      return sum + i.food.calories * ratio;
    }, 0);
  });

  selectedDateProteinIntake = computed(() => {
    if (!this.selectedDate()) return 0;
    return this.selectedDateIntakes().reduce((sum, i) => {
      const ratio = i.intakeSize / i.food.servingSize;
      return sum + i.food.protein * ratio;
    }, 0);
  });

  // userId no longer needed — RLS automatically scopes to auth.uid()

  ngOnInit(): void {
    this.loadData();
    this.buildForm();
  }

  loadData(): void {
    this.supabase.getFoodIntakes()
      .then(data => this.foodIntakes.set(data))
      .catch(err => console.error('Error fetching food intakes:', err));

    this.supabase.getFoodFacts()
      .then(data => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        this.foodFacts.set(sorted);
      })
      .catch(err => console.error('Error fetching food facts:', err));
  }

  private buildForm(intake?: FoodIntake): void {
    this.foodIntakeForm = this.fb.group({
      id: [intake?.id ?? null],
      foodId: [intake?.food?.id ?? null, Validators.required],
      intakeSize: [intake?.intakeSize ?? null, [Validators.required, Validators.min(1)]],
    });
  }

  private scrollToForm(): void {
    // Small timeout lets Angular finish rendering the updated form first
    setTimeout(() => {
      this.formSectionRef?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  }

  submitFoodIntake(): void {
    if (this.foodIntakeForm.invalid) return;

    const value = this.foodIntakeForm.value as FoodIntake;
    const fact = this.foodFacts().find(f => f.id === value.foodId);
    const ratio = value.intakeSize / (fact?.servingSize ?? 1);
    value.fiberIntake   = (fact?.fiber    ?? 0) * ratio;
    value.calorieIntake = (fact?.calories ?? 0) * ratio;
    value.proteinIntake = (fact?.protein  ?? 0) * ratio;

    this.supabase.submitFoodIntake(this.isEditing, value)
      .then(() => {
        this.loadData();
        this.resetForm();
      });
  }

  updateFoodIntake(intake: FoodIntake): void {
    this.isEditing = true;
    this.foodIntakeForm.setValue({
      id: intake.id,
      foodId: intake.food.id,
      intakeSize: intake.intakeSize,
    });
    this.scrollToForm();
  }

  deleteFoodIntake(id: number): void {
    this.supabase.deleteFoodIntake(id)
      .then(() => this.loadData())
      .catch(err => console.error('Error deleting food intake:', err));
  }

  resetForm(): void {
    this.isEditing = false;
    this.buildForm();
  }

  setSelectedDate(value: string): void {
    this.selectedDate.set(value);
  }
}