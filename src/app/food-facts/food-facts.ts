import { Component, OnInit, signal, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-food-facts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './food-facts.html',
  styleUrl: './food-facts.css',
})
export class FoodFactsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private supabase = inject(Supabase);

  @ViewChild('formSection') formSectionRef!: ElementRef<HTMLElement>;

  foodFacts = signal<FoodFact[]>([]);
  foodFactsForm!: FormGroup;
  isEditing = false;

  ngOnInit() {
    this.loadFoodFacts();
    this.buildForm();
  }

  loadFoodFacts() {
    this.supabase.getFoodFacts()
      .then(data => {
        const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
        this.foodFacts.set(sorted);
      })
      .catch(error => console.error('Error fetching food facts:', error));
  }

  private buildForm(fact?: FoodFact) {
    this.foodFactsForm = this.fb.group({
      id: [fact?.id ?? null],
      name: [fact?.name ?? '', Validators.required],
      servingSize: [fact?.servingSize ?? null, [Validators.required, Validators.min(1)]],
      unitOfMeasurement: [fact?.unitOfMeasurement ?? '', Validators.required],
      fiber: [fact?.fiber ?? null, [Validators.required, Validators.min(0)]],
      calories: [fact?.calories ?? null, [Validators.required, Validators.min(0)]],
      protein: [fact?.protein ?? null, [Validators.required, Validators.min(0)]],
    });
  }

  private scrollToForm(): void {
    setTimeout(() => {
      this.formSectionRef?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  }

  submitFoodFact() {
    if (this.foodFactsForm.valid) {
      const foodFactFormValue: FoodFact = this.foodFactsForm.value as FoodFact;
      this.supabase.submitFoodFact(this.isEditing, foodFactFormValue)
        .then(() => {
          this.loadFoodFacts();
          this.buildForm();
          this.isEditing = false;
        });
    }
  }

  updateFoodFact(fact: FoodFact) {
    this.isEditing = true;
    this.buildForm(fact);
    this.scrollToForm();
  }

  deleteFoodFact(id: number) {
    this.supabase.deleteFoodFact(id)
      .then(() => this.loadFoodFacts());
  }

  resetForm() {
    this.isEditing = false;
    this.buildForm();
  }
}