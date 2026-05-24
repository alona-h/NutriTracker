import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Supabase } from '../services/supabase';
import { AuthService } from '../services/auth';
import { Utils } from '../utils/utils';
import { SearchableSelectComponent, SelectOption } from '../shared/searchable-select';

@Component({
  selector: 'app-nutrition-log',
  standalone: true,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, FormsModule, SearchableSelectComponent],
  templateUrl: './nutrition-log.html',
  styleUrl: './nutrition-log.css',
})
export class NutritionLogComponent implements OnInit {
  private fb       = inject(FormBuilder);
  private supabase = inject(Supabase);
  private auth     = inject(AuthService);

  foodIntakes  = signal<NutritionEntry[]>([]);
  foodFacts    = signal<FoodItem[]>([]);
  showModal    = signal(false);
  isEditing    = false;
  entryForm!: FormGroup;

  // Signal-bridge for reactive form values so computed() re-runs on changes
  private formSnapshot = signal<{ foodId: number | null; intakeSize: number | null }>({ foodId: null, intakeSize: null });
  private formSub?: Subscription;

  readonly today     = Utils.toDateString(new Date());
  readonly yesterday = Utils.toDateString(new Date(Date.now() - 86400000));
  selectedDate = signal<string>(this.today);

  userProfile = computed(() => this.auth.userProfile());

  foodOptions = computed<SelectOption[]>(() =>
    this.foodFacts().map(f => ({ value: f.id, label: `${f.name} (${f.unitOfMeasurement})` }))
  );

  selectedDateIntakes = computed(() =>
    this.foodIntakes().filter(i => Utils.toDateString(i.createdAt) === this.selectedDate())
  );

  selectedTotals = computed(() =>
    this.selectedDateIntakes().reduce(
      (acc, i) => {
        const ratio = i.intakeSize / i.food.servingSize;
        return {
          calories: acc.calories + i.food.calories * ratio,
          protein:  acc.protein  + i.food.protein  * ratio,
          fiber:    acc.fiber    + i.food.fiber     * ratio,
        };
      },
      { calories: 0, protein: 0, fiber: 0 },
    )
  );

  // Live macro preview — reads from formSnapshot (a signal) so computed re-runs on every form change
  previewMacros = computed(() => {
    const { foodId, intakeSize } = this.formSnapshot();
    const fact = this.foodFacts().find(f => f.id === foodId);
    if (!fact || !intakeSize || intakeSize <= 0) return null;
    const ratio = intakeSize / fact.servingSize;
    return {
      calories: fact.calories * ratio,
      protein:  fact.protein  * ratio,
      fiber:    fact.fiber    * ratio,
    };
  });

  selectedFoodName = computed(() => {
    const { foodId } = this.formSnapshot();
    return this.foodFacts().find(f => f.id === foodId)?.name ?? null;
  });

  selectedFoodUnit = computed(() => {
    const { foodId } = this.formSnapshot();
    return this.foodFacts().find(f => f.id === foodId)?.unitOfMeasurement ?? '';
  });

  ngOnInit(): void {
    this.loadData();
    this.buildForm();
  }

  loadData(): void {
    this.supabase.getFoodIntakes()
      .then((data: NutritionEntry[]) => this.foodIntakes.set(data))
      .catch((err: unknown) => console.error('Error fetching food intakes:', err));

    this.supabase.getFoodFacts()
      .then(data => this.foodFacts.set([...data].sort((a, b) => a.name.localeCompare(b.name))))
      .catch(err => console.error('Error fetching food facts:', err));
  }

  private buildForm(intake?: NutritionEntry): void {
    this.formSub?.unsubscribe();
    this.entryForm = this.fb.group({
      id:         [intake?.id ?? null],
      foodId:     [intake?.food?.id ?? null, Validators.required],
      intakeSize: [intake?.intakeSize ?? null, [Validators.required, Validators.min(1)]],
    });
    // Seed the snapshot with initial values (covers the edit case where fields are pre-filled)
    this.formSnapshot.set({ foodId: this.entryForm.value.foodId, intakeSize: this.entryForm.value.intakeSize });
    // Keep snapshot in sync with every subsequent change
    this.formSub = this.entryForm.valueChanges.subscribe(v =>
      this.formSnapshot.set({ foodId: v.foodId, intakeSize: v.intakeSize })
    );
  }

  openAdd(): void {
    this.isEditing = false;
    this.buildForm();
    this.showModal.set(true);
  }

  openEdit(intake: NutritionEntry): void {
    this.isEditing = true;
    this.buildForm(intake);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitEntry(): void {
    if (this.entryForm.invalid) return;
    const value = this.entryForm.value as NutritionEntry;
    const fact  = this.foodFacts().find(f => f.id === value.foodId);
    const ratio = value.intakeSize / (fact?.servingSize ?? 1);
    value.fiberIntake   = (fact?.fiber    ?? 0) * ratio;
    value.calorieIntake = (fact?.calories ?? 0) * ratio;
    value.proteinIntake = (fact?.protein  ?? 0) * ratio;

    this.supabase.submitFoodIntake(this.isEditing, value)
      .then(() => { this.loadData(); this.closeModal(); });
  }

  pct(value: number, target: number): number {
    return Math.min(100, target > 0 ? Math.round((value / target) * 100) : 0);
  }

  openDatePicker(input: HTMLInputElement): void {
    try {
      input.showPicker();
    } catch {
      input.click();
    }
  }

  deleteEntry(id: number): void {
    this.supabase.deleteFoodIntake(id)
      .then(() => { this.loadData(); this.closeModal(); });
  }
}
