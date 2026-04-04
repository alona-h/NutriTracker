import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Supabase } from '../services/supabase';
import { Utils } from '../utils/utils';


@Component({
  selector: 'app-food-intake',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, FormsModule],
  templateUrl: './food-intake.html',
})
export class FoodIntakeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private supabase = inject(Supabase);

  foodIntakes = signal<FoodIntake[]>([]);
  foodFacts = signal<FoodFact[]>([]);

  foodIntakeForm!: FormGroup;
  isEditing = false;

  readonly today = Utils.toDateString(new Date());
  readonly yesterday = Utils.toDateString(new Date(Date.now() - 86400000));
  selectedDate = signal<string>(this.yesterday);
  
  todayIntakes = computed(() => this.foodIntakes().filter(i => Utils.toDateString(i.createdAt) === this.today));
  selectedDateIntakes = computed(() =>{
    if (!this.selectedDate()) return [];
    return this.foodIntakes().filter(i => Utils.toDateString(i.createdAt) === this.selectedDate());
  });

  todayFiberIntake = computed(() => 
    this.todayIntakes().reduce((sum, i) => {
    const ratio = i.intakeSize / i.food.servingSize;
    return sum + i.food.fiber * ratio;
  }, 0));
  selectedDateFiberIntake = computed(() => {
    if (!this.selectedDate()) return 0;
    return this.selectedDateIntakes().reduce((sum, i) => {
      const ratio = i.intakeSize / i.food.servingSize;
      return sum + i.food.fiber * ratio;
    }, 0);
  });

  ngOnInit() {
    this.loadFoodIntakes();

    this.buildForm();
  }

  loadFoodIntakes() {
    console.log('Loading food intakes');
    this.supabase.getFoodIntakes()
      .then(data => {
        this.foodIntakes.set(data);
        console.log('Food intakes fetched successfully:', data);
      })
      .catch(error => console.error('Error fetching food intakes:', error));

    this.supabase.getFoodFacts()
      .then(data => {
        this.foodFacts.set(data);
        console.log('Food facts fetched successfully:', data);
      })
      .catch(error => console.error('Error fetching food facts:', error));
  }


  private buildForm(intake?: FoodIntake) {
    this.foodIntakeForm = this.fb.group({
      id: [intake?.id ?? null],
      foodId: [intake?.food.id ?? null, Validators.required],
      intakeSize: [intake?.intakeSize ?? null, [Validators.required, Validators.min(1)]],
    });
  }

  submitFoodIntake() {
    if (this.foodIntakeForm.invalid) return;
    var foodIntakeFormValue: FoodIntake = this.foodIntakeForm.value as FoodIntake;
    foodIntakeFormValue.fiberIntake = foodIntakeFormValue.intakeSize * 
      (this.foodFacts().find(f => f.id === foodIntakeFormValue.foodId)?.fiber ?? 0) /
      (this.foodFacts().find(f => f.id === foodIntakeFormValue.foodId)?.servingSize ?? 1);

    console.log('Submitting food intake:', foodIntakeFormValue);
      this.supabase.submitFoodIntake(this.isEditing, foodIntakeFormValue)
        .then(() => {
          console.log('Food intake submitted successfully');
          this.loadFoodIntakes(); // Refresh the list after submission
          this.buildForm();
          this.isEditing = false;
        });
    

    this.resetForm();
  }

  updateFoodIntake(intake: FoodIntake) {
    this.isEditing = true;
    this.foodIntakeForm.setValue({
      id: intake.id,
      foodId: intake.food.id,
      intakeSize: intake.intakeSize,
    });
  }

  deleteFoodIntake(id: number) {
    this.supabase.deleteFoodIntake(id)
      .then(() => {
        console.log('Food intake deleted successfully');
        this.loadFoodIntakes(); // Refresh the list after deletion
      })
      .catch(error => console.error('Error deleting food intake:', error)); 
  }

  resetForm() {
    this.isEditing = false;
    this.buildForm();
  }

  setSelectedDate(value: string) {
    this.selectedDate.set(value);
  }
}