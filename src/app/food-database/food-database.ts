import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-food-database',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './food-database.html',
  styleUrl: './food-database.css',
})
export class FoodDatabaseComponent implements OnInit {
  private fb       = inject(FormBuilder);
  private supabase = inject(Supabase);

  foodFacts  = signal<FoodItem[]>([]);
  showModal  = signal(false);
  isEditing  = false;
  foodForm!: FormGroup;

  searchQuery = signal('');

  filteredFoodItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return !q
      ? this.foodFacts()
      : this.foodFacts().filter(f => f.name.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    this.loadFoodItems();
    this.buildForm();
  }

  loadFoodItems(): void {
    this.supabase.getFoodFacts()
      .then((data: FoodItem[]) => this.foodFacts.set([...data].sort((a, b) => a.name.localeCompare(b.name))))
      .catch((err: unknown) => console.error('Error fetching food facts:', err));
  }

  private buildForm(fact?: FoodItem): void {
    this.foodForm = this.fb.group({
      id:                [fact?.id ?? null],
      name:              [fact?.name ?? '',   Validators.required],
      servingSize:       [fact?.servingSize ?? null, [Validators.required, Validators.min(1)]],
      unitOfMeasurement: [fact?.unitOfMeasurement ?? '', Validators.required],
      fiber:             [fact?.fiber    ?? null, [Validators.required, Validators.min(0)]],
      calories:          [fact?.calories ?? null, [Validators.required, Validators.min(0)]],
      protein:           [fact?.protein  ?? null, [Validators.required, Validators.min(0)]],
    });
  }

  openAdd(): void {
    this.isEditing = false;
    this.buildForm();
    this.showModal.set(true);
  }

  openEdit(fact: FoodItem): void {
    this.isEditing = true;
    this.buildForm(fact);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  submitFood(): void {
    if (this.foodForm.invalid) return;
    this.supabase.submitFoodFact(this.isEditing, this.foodForm.value as FoodItem)
      .then(() => { this.loadFoodItems(); this.closeModal(); });
  }

  deleteFood(id: number): void {
    this.supabase.deleteFoodFact(id)
      .then(() => { this.loadFoodItems(); this.closeModal(); });
  }
}
