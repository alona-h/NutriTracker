import { Component, OnInit, signal, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-food-facts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './food-facts.html',
})
export class FoodFactsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private supabase = inject(Supabase);

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
        this.foodFacts.set(data);
        console.log('Food facts fetched successfully:', data);
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
    });
  }

  submitFoodFact() {
    // Implement submit functionality here
    console.log('Submitting food fact');
    if (this.foodFactsForm.valid) {
      var foodFactFormValue: FoodFact = this.foodFactsForm.value as FoodFact;
      this.supabase.submitFoodFact(this.isEditing, foodFactFormValue)
        .then(() => {
          console.log('Food fact submitted successfully');
          this.loadFoodFacts(); // Refresh the list after submission
          this.buildForm();
          this.isEditing = false;
        });
    }
  }

  updateFoodFact(fact: FoodFact) {
    this.isEditing = true;
    this.buildForm(fact);
  }

  deleteFoodFact(id: number) {
    console.log('Deleting food fact:', id);
    this.supabase.deleteFoodFact(id)
      .then(() => {
        console.log('Food fact deleted successfully');
        this.loadFoodFacts(); // Refresh the list after deletion
      });
  }

  resetForm() {
    this.isEditing = false;
    this.buildForm();
  }
}